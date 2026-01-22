import { getAllEmployees, deleteEmployee } from "./actions";
import { auth, clerkClient } from "@clerk/nextjs/server";
import Restaurant from "@/models/Restaurant";

// Mock Clerk authentication
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(),
  clerkClient: jest.fn(),
}));

// Mock dbConnect
jest.mock("../../../utils/dbConnect", () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(true),
}));

// Mock Restaurant model
jest.mock("../../../models/Restaurant", () => ({
  __esModule: true,
  default: {
    findById: jest.fn(() => ({
      lean: jest.fn(),
    })),
  },
}));

describe("Accounts Server Actions", () => {
  let adminClerkId: string;

  let consoleSpy: jest.SpyInstance;

  // Setup admin user before each test
  beforeEach(async () => {
    adminClerkId = "clerk_admin_test";

    // Mock admin authentication by default
    (auth as unknown as jest.Mock).mockResolvedValue({
      userId: adminClerkId,
      sessionClaims: { metadata: { role: "admin" } },
    });

    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });
  }, 10000);

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe("getAllEmployees", () => {
    it("should return empty array when no employees exist", async () => {
      // Mock Clerk client returning no users with worker/manager roles
      const mockGetUserList = jest.fn().mockResolvedValue({ data: [] });
      (clerkClient as unknown as jest.Mock).mockResolvedValue({
        users: {
          getUserList: mockGetUserList,
        },
      });

      const result = await getAllEmployees();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it("should return all employees with their details", async () => {
      const restaurantId = "507f1f77bcf86cd799439011";

      // Mock Restaurant.findById().lean()
      (Restaurant.findById as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          name: "Test Restaurant",
        }),
      });

      const mockEmployees = [
        {
          id: "clerk_worker_1",
          firstName: "John",
          lastName: "Worker",
          publicMetadata: { role: "worker", restaurantId: restaurantId },
        },
        {
          id: "clerk_manager_1",
          firstName: "Jane",
          lastName: "Manager",
          publicMetadata: { role: "manager", restaurantId: restaurantId },
        },
      ];

      // Mock Clerk client
      const mockGetUserList = jest
        .fn()
        .mockResolvedValue({ data: mockEmployees });

      (clerkClient as unknown as jest.Mock).mockResolvedValue({
        users: {
          getUserList: mockGetUserList,
        },
      });

      const result = await getAllEmployees();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0]).toMatchObject({
        id: "clerk_worker_1",
        firstName: "John",
        lastName: "Worker",
        restaurantName: "Test Restaurant",
        role: "worker",
      });
      expect(result.data?.[1]).toMatchObject({
        id: "clerk_manager_1",
        firstName: "Jane",
        lastName: "Manager",
        restaurantName: "Test Restaurant",
        role: "manager",
      });
    });

    it("should handle missing restaurant gracefully", async () => {
      // Mock Restaurant.findById().lean() returning null
      (Restaurant.findById as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      const mockEmployees = [
        {
          id: "clerk_worker_orphan",
          firstName: "Orphan",
          lastName: "Worker",
          publicMetadata: {
            role: "worker",
            restaurantId: "507f1f77bcf86cd799439011",
          },
        },
      ];

      // Mock Clerk client
      const mockGetUserList = jest
        .fn()
        .mockResolvedValue({ data: mockEmployees });

      (clerkClient as unknown as jest.Mock).mockResolvedValue({
        users: {
          getUserList: mockGetUserList,
        },
      });

      const result = await getAllEmployees();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].restaurantName).toBe("Nije pridodijeljen");
    });

    it("should return error when user is not authenticated", async () => {
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: null });

      const result = await getAllEmployees();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Unauthorized");
    });

    it("should return error when user is not an admin", async () => {
      (auth as unknown as jest.Mock).mockResolvedValue({
        userId: "clerk_student_test",
        sessionClaims: { metadata: { role: "student" } },
      });

      const result = await getAllEmployees();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Only admins can view employee accounts");
    });
  });

  describe("deleteEmployee", () => {
    it("should delete employee successfully", async () => {
      const clerkId = "clerk_delete_test";

      // Mock Clerk getUser to return a worker
      const mockGetUser = jest.fn().mockResolvedValue({
        id: clerkId,
        publicMetadata: { role: "worker" },
      });
      const mockDeleteUser = jest.fn().mockResolvedValue({});

      (clerkClient as unknown as jest.Mock).mockResolvedValue({
        users: {
          getUser: mockGetUser,
          deleteUser: mockDeleteUser,
        },
      });

      const result = await deleteEmployee(clerkId);

      expect(result.success).toBe(true);
      expect(mockDeleteUser).toHaveBeenCalledWith(clerkId);
    });

    it("should prevent deletion of admin accounts", async () => {
      const clerkId = "clerk_admin_delete_test";

      // Mock Clerk getUser to return an admin
      const mockGetUser = jest.fn().mockResolvedValue({
        id: clerkId,
        publicMetadata: { role: "admin" },
      });

      (clerkClient as unknown as jest.Mock).mockResolvedValue({
        users: {
          getUser: mockGetUser,
        },
      });

      const result = await deleteEmployee(clerkId);

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "Can only delete manager, worker, or unassigned accounts",
      );
    });

    it("should handle Clerk deletion errors", async () => {
      const clerkId = "clerk_delete_error_test";

      // Mock Clerk getUser to return a worker
      const mockGetUser = jest.fn().mockResolvedValue({
        id: clerkId,
        publicMetadata: { role: "worker" },
      });
      const mockDeleteUser = jest
        .fn()
        .mockRejectedValue(new Error("Clerk API error"));

      (clerkClient as unknown as jest.Mock).mockResolvedValue({
        users: {
          getUser: mockGetUser,
          deleteUser: mockDeleteUser,
        },
      });

      const result = await deleteEmployee(clerkId);

      expect(result.success).toBe(false);
      expect(result.error).toBe(
        "Failed to delete employee from authentication system",
      );
    });

    it("should return error when user is not authenticated", async () => {
      (auth as unknown as jest.Mock).mockResolvedValue({ userId: null });

      const result = await deleteEmployee("clerk_id");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Unauthorized");
    });

    it("should return error when user is not an admin", async () => {
      (auth as unknown as jest.Mock).mockResolvedValue({
        userId: "clerk_student_test",
        sessionClaims: { metadata: { role: "student" } },
      });

      const result = await deleteEmployee("clerk_id");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Only admins can delete employee accounts");
    });
  });
});
