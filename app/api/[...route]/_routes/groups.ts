import { Hono } from "hono";
import { db } from "@/db";

import {
  groups as groupsTable,
  hatians,
  SelectUserSchema,
  userExpenses,
  usersToGroups,
} from "@/db/schema";
import { count, eq } from "drizzle-orm";

const groups = new Hono();

groups.post("/create", async (c) => {
  const body = await c.req.json();

  try {
    const group = await db
      .insert(groupsTable)
      .values({
        name: body.name,
      })
      .returning({ id: groupsTable.id });

    await db.insert(usersToGroups).values(
      body.members.map((member: SelectUserSchema) => ({
        user_id: member.id,
        group_id: group[0].id,
      }))
    );

    return c.json(group);
  } catch (error) {
    console.error(`${error}`);

    return c.text("Something went wrong", 500);
  }
});

groups.get("/:userId", async (c) => {
  const userId = c.req.param("userId");
  const clerkClient = c.get("clerk");

  const groups = await db.query.usersToGroups
    .findMany({
      where: eq(usersToGroups.user_id, userId),
      with: {
        group: {
          with: {
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
      const userGroups = data.map((usersToGroups) => {
        return usersToGroups.group;
      });

      return userGroups;
    });

  const usersToGroupsWithImages = [];

  for (const group of groups) {
    const hatianCount = await db
      .select({ count: count() })
      .from(hatians)
      .where(eq(hatians.group_id, group.id));

    const groupWithImages = {
      ...group,
      hatianCount: hatianCount[0].count,
      users: await Promise.all(
        group.users.map(async (user) => {
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
    usersToGroupsWithImages.push(groupWithImages);
  }

  return c.json(usersToGroupsWithImages);
});

groups.get("/:userId/:groupId", async (c) => {
  const groupId = c.req.param("groupId");
  const userId = c.req.param("userId");
  const clerkClient = c.get("clerk");

  const group = await db.query.groups.findFirst({
    where: eq(groupsTable.id, groupId),
    with: {
      hatians: {
        with: {
          transactions: {
            with: {
              userExpenses: {
                where: eq(userExpenses.user_id, userId),
              },
            },
          },
        },
      },
      users: {
        with: {
          user: true,
        },
      },
    },
  });

  if (!group) {
    return c.text("Group not found", 404);
  }

  const groupWithImages = {
    ...group,
    users: await Promise.all(
      group.users.map(async (user) => {
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

  return c.json(groupWithImages);
});

export default groups;
