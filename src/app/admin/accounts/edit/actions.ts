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
      return { success: false, error: "Unauthorized" };
    }

    if (sessionClaims?.metadata?.role !== "admin") {
      return {
        success: false,
        error: "Only admins can update employee accounts",
      };
    }

    const client = await clerkClient();

    // Prepare Clerk update data
    const clerkUpdateData: any = {};
    if (name !== undefined) clerkUpdateData.firstName = name;
    if (lastName !== undefined) clerkUpdateData.lastName = lastName;
    if (username !== undefined) clerkUpdateData.username = username;
    if (password !== undefined) clerkUpdateData.password = password;

    // Update user in Clerk if there are any profile updates
    if (Object.keys(clerkUpdateData).length > 0) {
      try {
        await client.users.updateUser(userId, clerkUpdateData);
      } catch (clerkError: any) {
        console.error("Clerk update error:", clerkError);
        // ... handle Clerk errors (password, username exists, etc.)
        return { success: false, error: "Greška prilikom ažuriranja Clerk korisnika" };
      }
    }

    // Update metadata in Clerk if role or restaurantId changed
    if (role !== undefined || restaurantId !== undefined) {
      const publicMetadata: any = {};
      if (role !== undefined) publicMetadata.role = role;
      if (restaurantId !== undefined) publicMetadata.restaurantId = restaurantId;

      await client.users.updateUserMetadata(userId, {
        publicMetadata,
      });
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
      error: "Neuspješno ažuriranje računa zaposlenika",
    };
  }
}

export async function getEmployeeAccount(clerkId: string) {
  try {
    // Verify the current user is an admin
    const { userId: currentUserId, sessionClaims } = await auth();
    if (!currentUserId) {
      return { success: false, error: "Unauthorized" };
    }

    if (sessionClaims?.metadata?.role !== "admin") {
      return {
        success: false,
        error: "Only admins can view employee accounts",
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
      },
    };
  } catch (error: any) {
    console.error("Error fetching employee account:", error);
    return {
      success: false,
      error: "Neuspješno dohvaćanje podataka o zaposleniku",
    };
  }
}
