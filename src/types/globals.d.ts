export { }

// Create a type for the roles
export type Roles = 'admin' | 'moderator' | 'user' | null

declare global {
    interface CustomJwtSessionClaims {
        metadata: {
            role?: Roles
        }
    }
}