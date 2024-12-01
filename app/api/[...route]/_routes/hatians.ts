import { Hono } from "hono";
import {
  hatians as hatiansTable,
  SelectUserSchema,
  transactions,
  userExpenses,
  usersToHatians,
} from "@/db/schema";
import { db } from "@/db";
import { and, count, eq } from "drizzle-orm";

const hatians = new Hono();

hatians.post("/create", async (c) => {
  const body = await c.req.json();

  try {
    const hatian = await db
      .insert(hatiansTable)
      .values({
        name: body.name,
        group_id: body.group.id,
      })
      .returning({ id: hatiansTable.id });

    await db.insert(usersToHatians).values(
      body.members.map((member: SelectUserSchema) => ({
        user_id: member.id,
        hatian_id: hatian[0].id,
      }))
    );

    return c.json(hatian);
  } catch (error) {
    console.error(`${error}`);

    return c.text("Something went wrong", 500);
  }
});

hatians.get("/:userId", async (c) => {
  const userId = c.req.param("userId");
  const clerkClient = c.get("clerk");

  const hatians = await db.query.usersToHatians
    .findMany({
      where: eq(usersToHatians.user_id, userId),
      with: {
        hatian: {
          with: {
            transactions: {
              with: {
                userExpenses: {
                  where: eq(userExpenses.user_id, userId),
                },
              },
            },
            users: {
              with: {
                user: true,
              },
            },
          },
        },
      },
    })
    .then((data) => {
      const userHatians = data.map((usersToHatians) => {
        return usersToHatians.hatian;
      });

      return userHatians;
    });

  const usersToHatiansWithImages = [];

  for (const hatian of hatians) {
    const hatianWithImages = {
      ...hatian,
      users: await Promise.all(
        hatian.users.map(async (user) => {
          const userWithImage = await clerkClient.users.getUser(
            user.user.clerk_id
          );
          return {
            user: {
              ...user.user,
              image: userWithImage.imageUrl,
            },
          };
        })
      ),
    };
    usersToHatiansWithImages.push(hatianWithImages);
  }

  return c.json(usersToHatiansWithImages);
});

hatians.get("/:userId/:hatianId", async (c) => {
  const userId = c.req.param("userId");
  const hatianId = c.req.param("hatianId");
  const clerkClient = c.get("clerk");

  const hatian = await db.query.hatians.findFirst({
    where: eq(hatiansTable.id, hatianId),
    with: {
      transactions: {
        with: {
          paidBy: true,
          userExpenses: true,
        },
      },
      users: {
        with: {
          user: true,
        },
      },
    },
  });

  if (!hatian) {
    return c.text("Hatian not found", 404);
  }

  const hatianWithImages = {
    ...hatian,
    users: await Promise.all(
      hatian.users.map(async (user) => {
        const userWithImage = await clerkClient.users.getUser(
          user.user.clerk_id
        );
        return {
          user: {
            ...user.user,
            image: userWithImage.imageUrl,
          },
        };
      })
    ),
  };

  return c.json(hatianWithImages);
});

export default hatians;
