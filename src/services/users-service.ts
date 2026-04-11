import { db } from "../db";
import { users } from "../db/schema";
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
}
