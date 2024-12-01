import { Hono } from "hono";
import { handle } from "hono/vercel";
import auth from "./_routes/auth";
import users from "./_routes/users";
import { clerkMiddleware } from "@hono/clerk-auth";
import groups from "./_routes/groups";
import hatians from "./_routes/hatians";
import transactions from "./_routes/transactions";
import callback from "./_routes/callback";
import qrCodes from "./_routes/qrcodes";

interface Bindings {}

export const runtime = "edge";

const app = new Hono<{ Bindings: Bindings }>().basePath("/api");

app.use(
  "*",
  clerkMiddleware({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
    apiUrl: "https://api.clerk.com",
  })
);

app.get("/", async (c) => {
  return c.json({ message: "Hello from API" });
});

app.route("/auth", auth);
app.route("/users", users);
app.route("/groups", groups);
app.route("/hatians", hatians);
app.route("/transactions", transactions);
app.route("/qr-code", qrCodes);
app.route("/callback", callback);

const handler = handle(app);

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const OPTIONS = handler;
