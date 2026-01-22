"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import dbConnect from "@/utils/dbConnect";
import Restaurant from "@/models/Restaurant";

type EmployeeData = {
  id: string;
  firstName: string;
  lastName: string;
  restaurantName: string;
  role: "manager" | "worker" | null;
  imageUrl?: string;
  restaurantImage?: string;
};

type ActionResponse = {
  success: boolean;
  message?: string;
  data?: EmployeeData[];
  error?: string;
};

export async function getAllEmployees(): Promise<ActionResponse> {
  try {
    // Verify the current user is an admin
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    if (sessionClaims?.metadata?.role !== "admin") {
      return {
        success: false,
        error: "Only admins can view employee accounts",
      };
    }

    const client = await clerkClient();

    // Fetch all users from Clerk
    // Note: In a large app, you'd use pagination or filter by metadata if Clerk supports it directly in listUsers
    const clerkUsersResponse = await client.users.getUserList({
      limit: 100, // Adjust as needed
    });

    const employees = clerkUsersResponse.data.filter(
      (user) =>
        user.publicMetadata.role === "manager" ||
        user.publicMetadata.role === "worker" ||
        user.publicMetadata.role === null,
    );

    if (employees.length === 0) {
      return {
        success: true,
        message: "No employees found",
        data: [],
      };
    }

    await dbConnect();

    // Fetch data for each employee
    const employeeDataPromises = employees.map(async (clerkUser) => {
      try {
        const restaurantId = clerkUser.publicMetadata.restaurantId as string;
        let restaurantName = "Unknown";
        let restaurantImage: string | undefined;

        if (restaurantId) {
          const restaurant = await Restaurant.findById(restaurantId).lean();
          restaurantName = restaurant?.name || "Nije pridodijeljen";
          restaurantImage = restaurant?.imageUrl;
        } else {
          restaurantName = "Nije pridodijeljen";
        }

        return {
          id: clerkUser.id,
          firstName: clerkUser.firstName || "",
          lastName: clerkUser.lastName || "",
          restaurantName,
          role: clerkUser.publicMetadata.role as "manager" | "worker",
          imageUrl: clerkUser.imageUrl,
          restaurantImage,
        };
      } catch (error) {
        console.error(
          `Error fetching data for employee ${clerkUser.id}:`,
          error,
        );
        return {
          id: clerkUser.id,
          firstName: clerkUser.firstName || "Unknown",
          lastName: clerkUser.lastName || "Unknown",
          restaurantName: "Nije pridodijeljen",
          role: clerkUser.publicMetadata.role as "manager" | "worker",
        };
      }
    });

    const employeeData = await Promise.all(employeeDataPromises);

    return {
      success: true,
      message: `Retrieved ${employeeData.length} employees`,
      data: employeeData,
    };
  } catch (error: any) {
    console.error("Error retrieving employees:", error);
    return {
      success: false,
      error: "Failed to retrieve employee accounts",
    };
  }
}

export async function deleteEmployee(clerkId: string): Promise<ActionResponse> {
  try {
    // Verify the current user is an admin
    const { userId: currentUserId, sessionClaims } = await auth();
    if (!currentUserId) {
      return { success: false, error: "Unauthorized" };
    }

    if (sessionClaims?.metadata?.role !== "admin") {
      return {
        success: false,
        error: "Only admins can delete employee accounts",
      };
    }

    const client = await clerkClient();

    // Fetch user to verify role before deletion
    const userToDelete = await client.users.getUser(clerkId);
    const role = userToDelete.publicMetadata.role;

    if (
      role !== "manager" &&
      role !== "worker" &&
      role !== null &&
      role !== undefined
    ) {
      return {
        success: false,
        error: "Can only delete manager, worker, or unassigned accounts",
      };
    }

    // Delete from Clerk
    try {
      await client.users.deleteUser(clerkId);
    } catch (clerkError) {
      console.error("Error deleting user from Clerk:", clerkError);
      return {
        success: false,
        error: "Failed to delete employee from authentication system",
      };
    }

    return {
      success: true,
      message: "Employee account deleted successfully",
    };
  } catch (error: any) {
    console.error("Error deleting employee:", error);
    return {
      success: false,
      error: "Failed to delete employee account",
    };
  }
}
