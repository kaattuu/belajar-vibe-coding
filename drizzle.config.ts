import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "#!@$AstagFirullohalAdzim#212#",
    database: process.env.DB_NAME || "belajar_vibe_coding",
  },
} satisfies Config;
