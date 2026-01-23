"use server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { UserRole } from "@/types/globals";

interface CreateEmployeeAccountParams {
  name: string;
  lastName: string;
  username: string;
  password: string;
  role?: UserRole;
  restaurantId?: string;
}

export async function createEmployeeAccount({
  name,
  lastName,
  username,
  password,
  role,
  restaurantId,
}: CreateEmployeeAccountParams) {
  try {
    // Verify the current user is an admin
    const { userId, sessionClaims } = await auth();
    if (!userId) {
      return { success: false, errorKey: "unauthorized" };
    }

    if (sessionClaims?.metadata?.role !== "admin") {
      return {
        success: false,
        errorKey: "onlyAdminsCanCreateEmployeeAccounts",
      };
    }

    // Validate role if provided
    if (role && role !== "manager" && role !== "worker") {
      return { success: false, errorKey: "roleMustBeManagerOrWorker" };
    }

    // Create user in Clerk
    const client = await clerkClient();
    const clerkUser = await client.users.createUser({
      username: username.trim(),
      password,
      firstName: name,
      lastName: lastName,
      skipPasswordRequirement: false,
      publicMetadata: {
        role: role ?? null,
        restaurantId: restaurantId ?? null,
        isEmployee: true,
      },
    });

    return {
      success: true,
      message: "User account created successfully",
      user: {
        id: clerkUser.id, // Use Clerk ID as the primary ID
        clerkId: clerkUser.id,
        username,
        name,
        lastName,
        role,
        restaurantId,
      },
    };
  } catch (error: any) {
    console.error("Error creating employee account:", error);

    // Handle Clerk-specific errors
    if (error.clerkError) {
      // Check for password-related errors
      const passwordError = error.errors?.find(
        (err: any) =>
          err.code === "form_password_pwned" ||
          err.code === "form_password_length_too_short" ||
          err.code === "form_password_not_strong_enough",
      );

      if (passwordError) {
        return {
          success: false,
          errorKey: "passwordMinLength",
        };
      }

      // Check for username exists error
      const usernameError = error.errors?.find(
        (err: any) => err.code === "form_identifier_exists",
      );

      if (usernameError) {
        return { success: false, errorKey: "usernameAlreadyExists" };
      }

      // Generic Clerk error
      return {
        success: false,
        error: error.errors?.[0]?.longMessage,
        errorKey: "clerkCreateAccountError",
      };
    }

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      return { success: false, error: error.message };
    }

    return { success: false, errorKey: "createEmployeeAccountFailed" };
  }
}
