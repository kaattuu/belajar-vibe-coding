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
            name: t.String(),
            email: t.String(),
            password: t.String(),
          }),
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
  });
