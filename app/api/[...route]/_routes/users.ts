import { Hono } from "hono";
import { users as usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/db";

const users = new Hono();

users.get("/", async (c) => {
  const query = c.req.query("search");

  const clerkClient = c.get("clerk");

  if (query) {
    // Return users with images based on query
    const users_result = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.user_code, query));

    if (users_result.length === 0) {
      return c.json({ users: [] });
    }

    const usersWithImages = [];

    for (const user of users_result) {
      const userWithImage = await clerkClient.users.getUser(user.clerk_id);

      usersWithImages.push({
        ...user,
        image: userWithImage.imageUrl,
      });
    }

    return c.json({ users: usersWithImages });
  } else {
    // Return all users with images
    const users_result = await db.select().from(usersTable);

    const usersWithImages = [];

    for (const user of users_result) {
      const userWithImage = await clerkClient.users.getUser(user.clerk_id);

      usersWithImages.push({
        ...user,
        image: userWithImage.imageUrl,
      });
    }

    return c.json({ users: users_result });
  }
});

users.get("/me", async (c) => {
  const clerkId = c.req.query("clerk_id");

  const user = await db.query.users.findFirst({
    where: (usersTable, { eq }) => eq(usersTable.clerk_id, clerkId!),
    with: {
      qrCodes: true,
    },
  });

  if (!user) {
    return c.text("User not found", 404);
  }

  return c.json(user);
});

export default users;
