import { getEmployeeAccount, updateEmployeeAccount } from "./actions";
import { auth, clerkClient } from "@clerk/nextjs/server";

// Mock Clerk authentication
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(),
  clerkClient: jest.fn(),
}));

describe("Edit Account Server Actions", () => {
  let adminClerkId: string;
  const testEmployeeId = "clerk_test_employee";

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

  describe("getEmployeeAccount", () => {
    it("should return employee details successfully", async () => {
      const mockUser = {
        id: testEmployeeId,
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        publicMetadata: {
          role: "worker",
          restaurantId: "507f1f77bcf86cd799439011",
        },
      };

      const mockGetUser = jest.fn().mockResolvedValue(mockUser);
      (clerkClient as unknown as jest.Mock).mockResolvedValue({
        users: {
          getUser: mockGetUser,
        },
      });

      const result = await getEmployeeAccount(testEmployeeId);

      expect(result.success).toBe(true);
      expect(result.user).toMatchObject({
        id: testEmployeeId,
        name: "John",
        lastName: "Doe",
        username: "johndoe",
        role: "worker",
        restaurantId: "507f1f77bcf86cd799439011",
      });
    });

    it("should return error when user is not authenticated", async () => {
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: null });

      const result = await getEmployeeAccount(testEmployeeId);

      expect(result.success).toBe(false);
      expect(result.errorKey).toBe("unauthorized");
    });
  });

  describe("updateEmployeeAccount", () => {
    const updateData = {
      userId: testEmployeeId,
      name: "Jane",
      lastName: "Smith",
      role: "manager" as const,
      restaurantId: "507f1f77bcf86cd799439012",
    };

    it("should update employee account successfully", async () => {
      const mockUpdateUser = jest.fn().mockResolvedValue({});
      const mockUpdateMetadata = jest.fn().mockResolvedValue({});

      (clerkClient as unknown as jest.Mock).mockResolvedValue({
        users: {
          updateUser: mockUpdateUser,
          updateUserMetadata: mockUpdateMetadata,
        },
      });

      const result = await updateEmployeeAccount(updateData);

      expect(result.success).toBe(true);
      expect(mockUpdateUser).toHaveBeenCalledWith(
        testEmployeeId,
        expect.objectContaining({
          firstName: updateData.name,
          lastName: updateData.lastName,
        }),
      );
      expect(mockUpdateMetadata).toHaveBeenCalledWith(testEmployeeId, {
        publicMetadata: {
          role: updateData.role,
          restaurantId: updateData.restaurantId,
        },
      });
    });

    it("should return error when user is not an admin", async () => {
      (auth as unknown as jest.Mock).mockResolvedValue({
        userId: "clerk_student_test",
        sessionClaims: { metadata: { role: "student" } },
      });

      const result = await updateEmployeeAccount(updateData);

      expect(result.success).toBe(false);
      expect(result.errorKey).toBe("onlyAdminsCanUpdateEmployeeAccounts");
    });

    it("should handle Clerk update errors", async () => {
      const mockUpdateUser = jest
        .fn()
        .mockRejectedValue(new Error("Clerk error"));
      (clerkClient as unknown as jest.Mock).mockResolvedValue({
        users: {
          updateUser: mockUpdateUser,
        },
      });

      const result = await updateEmployeeAccount(updateData);

      expect(result.success).toBe(false);
      expect(result.errorKey).toBe("clerkUpdateUserError");
    });
  });
});
