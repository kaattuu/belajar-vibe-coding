import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";

export class UsersService {
  static async registerUser(payload: any) {
    // 1. Check if email already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, payload.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error("email sudah terdaftar");
    }

    // 2. Hash password using Bun's native bcrypt support
    const hashedPassword = await Bun.password.hash(payload.password, {
      algorithm: "bcrypt",
      cost: 10,
    });

    // 3. Insert user
    await db.insert(users).values({
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
    });

    return { success: true };
  }

  static async login(payload: any) {
    // 1. Find user by email
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, payload.email))
      .limit(1);

    if (user.length === 0) {
      throw new Error("email atau password salah");
    }

    // 2. Verify password
    const isPasswordMatch = await Bun.password.verify(
      payload.password,
      user[0].password
    );

    if (!isPasswordMatch) {
      throw new Error("email atau password salah");
    }

    // 3. Create session
    const token = crypto.randomUUID();

    await db.insert(sessions).values({
      token: token,
      userId: user[0].id,
    });

    return token;
  }

  static async getCurrentUser(token: string) {
    // 1. Join sessions and users to find the user associated with the token
    const result = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.token, token))
      .limit(1);

    if (result.length === 0) {
      throw new Error("unauthorized");
    }

    return result[0];
  }

  static async logout(token: string) {
    // 1. Find session by token
    const session = await db
      .select()
      .from(sessions)
      .where(eq(sessions.token, token))
      .limit(1);

    if (session.length === 0) {
      throw new Error("unauthorized");
    }

    // 2. Delete session
    await db.delete(sessions).where(eq(sessions.token, token));
  }
}
