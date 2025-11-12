import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Simple password hashing (in production, use proper bcrypt or similar)
// For MVP, we'll use a basic hash - should be replaced with proper auth
function hashPassword(password: string): string {
    // This is a placeholder - in production use bcrypt or similar
    // For now, we'll just use a simple hash for demonstration
    return Buffer.from(password).toString("base64");
}

function verifyPassword(password: string, hash: string): boolean {
    return hashPassword(password) === hash;
}

/**
 * Sign up a new user with email and password
 */
export const signUp = mutation({
    args: {
        email: v.string(),
        password: v.string(),
        displayName: v.string(),
    },
    handler: async (ctx, args) => {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(args.email)) {
            throw new Error("Invalid email format");
        }

        // Validate password length
        if (args.password.length < 6) {
            throw new Error("Password must be at least 6 characters");
        }

        // Check if user already exists
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (existingUser) {
            throw new Error("User with this email already exists");
        }

        // Create new user
        const userId = await ctx.db.insert("users", {
            email: args.email,
            displayName: args.displayName,
            ecoPoints: 0,
            isAnonymous: false,
            lastActive: Date.now(),
            passwordHash: hashPassword(args.password),
        });

        return {
            userId,
            email: args.email,
            displayName: args.displayName,
            ecoPoints: 0,
        };
    },
});

/**
 * Sign in an existing user with email and password
 */
export const signIn = mutation({
    args: {
        email: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        // Find user by email
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        if (!user) {
            throw new Error("Invalid email or password");
        }

        // Verify password
        if (!verifyPassword(args.password, user.passwordHash)) {
            throw new Error("Invalid email or password");
        }

        // Update last active timestamp
        await ctx.db.patch(user._id, {
            lastActive: Date.now(),
        });

        return {
            userId: user._id,
            email: user.email,
            displayName: user.displayName,
            ecoPoints: user.ecoPoints,
            isAnonymous: user.isAnonymous,
        };
    },
});

/**
 * Get current user information
 */
export const getCurrentUser = query({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);

        if (!user) {
            return null;
        }

        return {
            userId: user._id,
            email: user.email,
            displayName: user.displayName,
            ecoPoints: user.ecoPoints,
            isAnonymous: user.isAnonymous,
        };
    },
});

/**
 * Update user privacy settings
 */
export const updatePrivacy = mutation({
    args: {
        userId: v.id("users"),
        isAnonymous: v.boolean(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, {
            isAnonymous: args.isAnonymous,
        });

        return { success: true };
    },
});
