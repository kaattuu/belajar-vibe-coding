import { Elysia } from "elysia";
import { usersRoute } from "./src/routes/users-route";

const app = new Elysia()
  .get("/", () => "Hello Elysia from Bun!")
  .get("/health", () => ({ status: "ok" }))
  .use(usersRoute)
  .listen(process.env.PORT || 3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);