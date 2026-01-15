import { getUserRole } from "./actions";
import { auth } from "@clerk/nextjs/server";

// Mock Clerk authentication
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(),
}));

describe("App Root Server Actions", () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe("getUserRole", () => {
    it("should return error when user is not authenticated", async () => {
      // Mock unauthenticated user
      (auth as unknown as jest.Mock).mockResolvedValue({
        userId: null,
        sessionClaims: null,
      });

      const result = await getUserRole();

      expect(result.role).toBeNull();
      expect(result.error).toBe("Unauthorized");
    });

    it("should return student role by default if no metadata is present", async () => {
      // Mock authenticated user with no metadata
      const mockUserId = "clerk_test_user_123";
      (auth as unknown as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        sessionClaims: { metadata: {} },
      });

      const result = await getUserRole();

      expect(result.role).toBe("student");
      expect(result.error).toBeNull();
    });

    it("should return existing user role from session claims", async () => {
      // Mock authenticated user with admin role
      const mockUserId = "clerk_existing_user_456";
      (auth as unknown as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        sessionClaims: { metadata: { role: "admin" } },
      });

      const result = await getUserRole();

      expect(result.role).toBe("admin");
      expect(result.error).toBeNull();
    });

    it("should return worker role from session claims", async () => {
      // Mock authenticated user with worker role
      const mockUserId = "clerk_worker_789";
      (auth as unknown as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        sessionClaims: {
          metadata: { role: "worker", restaurantId: "restaurant_123" },
        },
      });

      const result = await getUserRole();

      expect(result.role).toBe("worker");
      expect(result.error).toBeNull();
    });

    it("should return manager role from session claims", async () => {
      // Mock authenticated user with manager role
      const mockUserId = "clerk_manager_101";
      (auth as unknown as jest.Mock).mockResolvedValue({
        userId: mockUserId,
        sessionClaims: {
          metadata: { role: "manager", restaurantId: "restaurant_456" },
        },
      });

      const result = await getUserRole();

      expect(result.role).toBe("manager");
      expect(result.error).toBeNull();
    });

    it("should handle Clerk auth errors", async () => {
      // Mock auth throwing an error
      (auth as unknown as jest.Mock).mockRejectedValue(
        new Error("Clerk service unavailable"),
      );

      const result = await getUserRole();

      expect(result.role).toBeNull();
      expect(result.error).toBe("Failed to fetch user role");
    });
  });
});
