import { Elysia, t } from "elysia";
import { UsersService } from "../services/users-service";

export const usersRoute = new Elysia()
  .derive(({ headers }) => {
    const authHeader = headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { token: null };
    }
    return { token: authHeader.split(" ")[1] };
  })
  .group("/api/users", (app) =>
    app
      .post(
        "/",
        async ({ body, set }) => {
          try {
            await UsersService.registerUser(body);
            return { data: "OK" };
          } catch (error: any) {
            set.status = 400;
            return { error: error.message };
          }
        },
        {
          body: t.Object({
            name: t.String({ maxLength: 255 }),
            email: t.String({ maxLength: 255, format: "email" }),
            password: t.String({ minLength: 6, maxLength: 255 }),
          }),
          detail: {
            tags: ["Users"],
            summary: "Registrasi User Baru",
            description: "Mendaftarkan akun user baru ke database.",
          },
          response: {
            200: t.Object({ data: t.String({ default: "OK" }) }),
            400: t.Object({ error: t.String({ default: "email sudah terdaftar" }) }),
          },
        }
      )
      .post(
        "/login",
        async ({ body, set }) => {
          try {
            const token = await UsersService.login(body);
            return { data: token };
          } catch (error: any) {
            set.status = 400;
            return { error: error.message };
          }
        },
        {
          body: t.Object({
            email: t.String(),
            password: t.String(),
          }),
          detail: {
            tags: ["Users"],
            summary: "Login User",
            description: "Melakukan otentikasi user dan mengembalikan session token.",
          },
          response: {
            200: t.Object({ data: t.String({ default: "6a2f41a3-c54c-fce832..." }) }),
            400: t.Object({ error: t.String({ default: "email atau password salah" }) }),
          },
        }
      )
      .get("/current", async ({ token, set }) => {
        try {
          if (!token) throw new Error("unauthorized");

          const user = await UsersService.getCurrentUser(token);
          return { data: user };
        } catch (error: any) {
          set.status = error.message === "unauthorized" ? 401 : 500;
          return { error: error.message };
        }
      },
      {
        detail: {
          tags: ["Users"],
          summary: "Melihat Data Profil saat ini",
          description: "Mendapatkan informasi profil user yang sedang login (butuh Bearer Token).",
        },
        response: {
          200: t.Object({
            data: t.Object({
              id: t.Number({ default: 1 }),
              name: t.String({ default: "John Doe" }),
              email: t.String({ default: "john@example.com" }),
              createdAt: t.Any({ default: "2023-10-25T10:00:00.000Z" }),
            }),
          }),
          401: t.Object({ error: t.String({ default: "unauthorized" }) }),
          500: t.Object({ error: t.String({ default: "Internal server error" }) }),
        },
      })
  )
  .delete("/api/logout", async ({ token, set }) => {
    try {
      if (!token) throw new Error("unauthorized");

      await UsersService.logout(token);
      return { data: "OK" };
    } catch (error: any) {
      set.status = error.message === "unauthorized" ? 401 : 500;
      return { error: error.message };
    }
  },
  {
    detail: {
      tags: ["Users"],
      summary: "Logout User",
      description: "Menghapus session token dan keluar dari sistem.",
    },
    response: {
      200: t.Object({ data: t.String({ default: "OK" }) }),
      401: t.Object({ error: t.String({ default: "unauthorized" }) }),
      500: t.Object({ error: t.String({ default: "Internal server error" }) }),
    },
  });
