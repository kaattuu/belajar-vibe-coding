import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { usersRoute } from "./routes/users-route";

export const app = new Elysia()
  .use(
    swagger({
      documentation: {
        info: {
          title: "Belajar Vibe Coding API",
          version: "1.0.0",
          description: "Dokumentasi API untuk Autentikasi Pengguna",
        },
      },
    })
  )
  .get("/", () => "Hello Elysia from Bun!")
  .get("/health", () => ({ status: "ok" }))
  .use(usersRoute);
