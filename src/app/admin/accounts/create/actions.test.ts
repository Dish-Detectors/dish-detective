import { createEmployeeAccount } from "./actions";
import { auth, clerkClient } from "@clerk/nextjs/server";

// Mock Clerk authentication
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(),
  clerkClient: jest.fn(),
}));

describe("Create Account Server Actions", () => {
  let adminClerkId: string;

  let consoleSpy: jest.SpyInstance;

  beforeEach(async () => {
    adminClerkId = "clerk_admin_test";

    // Mock admin authentication by default
    (auth as unknown as jest.Mock).mockResolvedValue({
      userId: adminClerkId,
      sessionClaims: { metadata: { role: "admin" } },
    });

    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  }, 10000);

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe("createEmployeeAccount", () => {
    const validEmployeeData = {
      name: "John",
      lastName: "Doe",
      username: "johndoe",
      password: "Password123!",
      role: "worker" as const,
      restaurantId: "507f1f77bcf86cd799439011",
    };

    it("should create a worker account successfully", async () => {
      const mockCreateUser = jest
        .fn()
        .mockResolvedValue({ id: "clerk_new_user_id" });
      (clerkClient as unknown as jest.Mock).mockResolvedValue({
        users: {
          createUser: mockCreateUser,
        },
      });

      const result = await createEmployeeAccount(validEmployeeData);

      expect(result.success).toBe(true);
      expect(mockCreateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: validEmployeeData.name,
          lastName: validEmployeeData.lastName,
          username: validEmployeeData.username,
          password: validEmployeeData.password,
          publicMetadata: {
            role: validEmployeeData.role,
            restaurantId: validEmployeeData.restaurantId,
          },
        }),
      );
    });

    it("should create a manager account successfully", async () => {
      const managerData = { ...validEmployeeData, role: "manager" as const };
      const mockCreateUser = jest
        .fn()
        .mockResolvedValue({ id: "clerk_new_manager_id" });
      (clerkClient as unknown as jest.Mock).mockResolvedValue({
        users: {
          createUser: mockCreateUser,
        },
      });

      const result = await createEmployeeAccount(managerData);

      expect(result.success).toBe(true);
      expect(mockCreateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          publicMetadata: {
            role: "manager",
            restaurantId: validEmployeeData.restaurantId,
          },
        }),
      );
    });

    it("should return error when user is not authenticated", async () => {
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: null });

      const result = await createEmployeeAccount(validEmployeeData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Unauthorized");
    });

    it("should return error when user is not an admin", async () => {
      (auth as unknown as jest.Mock).mockResolvedValue({
        userId: "clerk_student_test",
        sessionClaims: { metadata: { role: "student" } },
      });

      const result = await createEmployeeAccount(validEmployeeData);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Only admins can create employee accounts");
    });

    it("should handle Clerk creation errors", async () => {
      const mockCreateUser = jest
        .fn()
        .mockRejectedValue({ clerkError: true, errors: [] });
      (clerkClient as unknown as jest.Mock).mockResolvedValue({
        users: {
          createUser: mockCreateUser,
        },
      });

      const result = await createEmployeeAccount(validEmployeeData);

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "Greška prilikom kreiranja računa u Clerk sustavu",
      );
    });
  });
});
