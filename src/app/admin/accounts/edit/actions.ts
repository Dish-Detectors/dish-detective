"use server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { UserRole } from "@/types/globals";

interface UpdateEmployeeAccountParams {
  userId: string; // This is now the Clerk ID
  name?: string;
  lastName?: string;
  username?: string;
  password?: string;
  role?: UserRole;
  restaurantId?: string;
}

export async function updateEmployeeAccount({
  userId,
  name,
  lastName,
  username,
  password,
  role,
  restaurantId,
}: UpdateEmployeeAccountParams) {
  try {
    // Verify the current user is an admin
    const { userId: currentUserId, sessionClaims } = await auth();
    if (!currentUserId) {
      return { success: false, errorKey: "unauthorized" };
    }

    if (sessionClaims?.metadata?.role !== "admin") {
      return {
        success: false,
        errorKey: "onlyAdminsCanUpdateEmployeeAccounts",
      };
    }

    const client = await clerkClient();

    // Prepare Clerk update data
    const clerkUpdateData: any = {};
    if (name !== undefined) clerkUpdateData.firstName = name;
    if (lastName !== undefined) clerkUpdateData.lastName = lastName;
    if (username !== undefined) clerkUpdateData.username = username;
    if (password !== undefined) clerkUpdateData.password = password;

    // Prepare metadata if needed
    if (role !== undefined || restaurantId !== undefined) {
      const publicMetadata: any = { isEmployee: true };
      if (role !== undefined) publicMetadata.role = role;
      if (restaurantId !== undefined)
        publicMetadata.restaurantId = restaurantId;

      // Add metadata to update object
      clerkUpdateData.publicMetadata = publicMetadata;
    }

    // Perform single update if there is data
    if (Object.keys(clerkUpdateData).length > 0) {
      try {
        await client.users.updateUser(userId, clerkUpdateData);
      } catch (clerkError: any) {
        console.error("Clerk update error:", clerkError);
        return {
          success: false,
          errorKey: "clerkUpdateUserError",
        };
      }
    }

    return {
      success: true,
      message: "Employee account updated successfully",
      user: {
        id: userId,
        clerkId: userId,
        role,
        restaurantId,
      },
    };
  } catch (error: any) {
    console.error("Error updating employee account:", error);
    return {
      success: false,
      errorKey: "updateEmployeeAccountFailed",
    };
  }
}

export async function getEmployeeAccount(clerkId: string) {
  try {
    // Verify the current user is an admin
    const { userId: currentUserId, sessionClaims } = await auth();
    if (!currentUserId) {
      return { success: false, errorKey: "unauthorized" };
    }

    if (sessionClaims?.metadata?.role !== "admin") {
      return {
        success: false,
        errorKey: "onlyAdminsCanViewEmployeeAccounts",
      };
    }

    // Get user details from Clerk
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkId);

    return {
      success: true,
      user: {
        id: clerkUser.id,
        clerkId: clerkUser.id,
        name: clerkUser.firstName || "",
        lastName: clerkUser.lastName || "",
        username: clerkUser.username || "",
        role: clerkUser.publicMetadata.role as UserRole,
        restaurantId: (clerkUser.publicMetadata.restaurantId as string) || "",
        imageUrl: clerkUser.imageUrl,
      },
    };
  } catch (error: any) {
    console.error("Error fetching employee account:", error);
    return {
      success: false,
      errorKey: "fetchEmployeeFailed",
    };
  }
}
