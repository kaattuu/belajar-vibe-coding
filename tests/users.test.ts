import { describe, expect, it, beforeEach } from "bun:test";
import { app } from "../src/app";
import { db } from "../src/db";
import { users, sessions } from "../src/db/schema";

describe("Users API", () => {
  beforeEach(async () => {
    // Sanitasi data: hapus semua data di sessions dan users sebelum setiap test
    await db.delete(sessions);
    await db.delete(users);
  });

  describe("POST /api/users (Registration)", () => {
    it("should register a new user successfully", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "John Doe",
            email: "john@example.com",
            password: "password123",
          }),
        })
      );

      const result = await response.json();
      expect(response.status).toBe(200);
      expect(result.data).toBe("OK");
    });

    it("should fail to register if email already exists", async () => {
      // Setup: register first user
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "John Doe",
            email: "john@example.com",
            password: "password123",
          }),
        })
      );

      // Attempt to register again with same email
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Jane Doe",
            email: "john@example.com",
            password: "password456",
          }),
        })
      );

      const result = await response.json();
      expect(response.status).toBe(400);
      expect(result.error).toBe("email sudah terdaftar");
    });

    it("should fail registration due to validation (long name > 255)", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "a".repeat(300),
            email: "long@example.com",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(422); // Validation error (maxLength)
    });

    it("should fail registration due to invalid email format", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Bad Email",
            email: "not-an-email",
            password: "password123",
          }),
        })
      );

      expect(response.status).toBe(422);
    });
  });

  describe("POST /api/users/login", () => {
    it("should login successfully and return a token", async () => {
      // Setup: register user
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Login User",
            email: "login@example.com",
            password: "password123",
          }),
        })
      );

      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "login@example.com",
            password: "password123",
          }),
        })
      );

      const result = await response.json();
      expect(response.status).toBe(200);
      expect(result.data).toBeDefined();
    });

    it("should fail login with wrong password", async () => {
      // Setup: register user
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Login User",
            email: "login@example.com",
            password: "password123",
          }),
        })
      );

      const response = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "login@example.com",
            password: "wrongpassword",
          }),
        })
      );

      expect(response.status).toBe(400);
    });
  });

  describe("Protected Routes", () => {
    let token: string;

    beforeEach(async () => {
      // Setup: Register and Login to get token
      await app.handle(
        new Request("http://localhost/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Auth User",
            email: "auth@example.com",
            password: "password123",
          }),
        })
      );

      const loginRes = await app.handle(
        new Request("http://localhost/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "auth@example.com",
            password: "password123",
          }),
        })
      );
      const loginResult = await loginRes.json();
      token = loginResult.data;
    });

    it("GET /api/users/current should return user profile", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );

      const result = await response.json();
      expect(response.status).toBe(200);
      expect(result.data.email).toBe("auth@example.com");
      expect(result.data.name).toBe("Auth User");
    });

    it("GET /api/users/current should fail without token", async () => {
      const response = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
        })
      );

      expect(response.status).toBe(401);
    });

    it("DELETE /api/logout should invalidate the session", async () => {
      // 1. Logout
      const logoutRes = await app.handle(
        new Request("http://localhost/api/logout", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );
      expect(logoutRes.status).toBe(200);

      // 2. Try to access protected route after logout
      const currentRes = await app.handle(
        new Request("http://localhost/api/users/current", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );
      expect(currentRes.status).toBe(401);
    });
  });
});
