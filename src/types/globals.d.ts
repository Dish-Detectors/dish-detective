export type UserRole = "admin" | "manager" | "worker" | "student";

declare global {
    interface CustomJwtSessionClaims {
        metadata: {
            role?: UserRole;
            restaurantId?: string;
        };
    }
}
