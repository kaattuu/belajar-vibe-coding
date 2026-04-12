import { Elysia } from "elysia";
import { usersRoute } from "./routes/users-route";

export const app = new Elysia()
  .get("/", () => "Hello Elysia from Bun!")
  .get("/health", () => ({ status: "ok" }))
  .use(usersRoute);
