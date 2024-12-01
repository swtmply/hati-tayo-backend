import { Hono } from "hono";
import { adjectives, animals } from "unique-names-generator";
import { uniqueNamesGenerator } from "unique-names-generator";
import { users } from "@/db/schema";
import { db } from "@/db";
import { eq } from "drizzle-orm";

const auth = new Hono();

auth.get("/", async (c) => {
  return c.json({ message: "Hello from auth" });
});

auth.post("/create-user", async (c) => {
  const randomName = uniqueNamesGenerator({
    dictionaries: [adjectives, animals], // colors can be omitted here as not used
    length: 2,
    separator: " ",
    style: "capital",
  });

  let user_code = Math.floor(100000 + Math.random() * 900000);
  let existingUser;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    existingUser = await db
      .select()
      .from(users)
      .where(eq(users.user_code, user_code.toString()));
    if (existingUser.length === 0) break;

    // Generate new code if exists
    user_code = Math.floor(100000 + Math.random() * 900000);
    attempts++;
  } while (attempts < maxAttempts);

  if (attempts >= maxAttempts) {
    return c.json({ error: "Could not generate unique user code" }, 500);
  }

  const body = await c.req.json();
  const { clerk_id, email, name } = body;

  await db.insert(users).values({
    clerk_id,
    email,
    name: name || randomName,
    user_code: user_code.toString(),
  });

  return c.json({ message: "User created successfully" });
});

export default auth;
