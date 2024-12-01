import { Hono } from "hono";
import { db } from "@/db";
import {
  SelectUserSchema,
  transactions as transactionsTable,
  userExpenses,
  usersToTransactions,
} from "@/db/schema";
import { and, eq, ne, or } from "drizzle-orm";

const transactions = new Hono();

transactions.post("/create", async (c) => {
  const { name, amount, paidBy, splitType, hatian, users } = await c.req.json();

  try {
    const transaction = await db
      .insert(transactionsTable)
      .values({
        name,
        amount,
        paid_by_id: paidBy,
        split_type: splitType,
        hatian_id: hatian && hatian.id, // If hatian is not provided
        // possible kasi na walang hatian
        // transaction lang agad
      })
      .returning({ id: transactionsTable.id });

    await db.insert(usersToTransactions).values(
      users.map((user: SelectUserSchema) => ({
        user_id: user.id,
        transaction_id: transaction[0].id,
      }))
    );

    const amountPerUser = Number(amount) / users.length;

    await db.insert(userExpenses).values(
      users.map((user: SelectUserSchema) => ({
        user_id: user.id,
        transaction_id: transaction[0].id,
        owed: user.id === paidBy ? "0" : amountPerUser.toString(),
        paid: user.id === paidBy ? amountPerUser.toString() : "0",
        settled: user.id === paidBy,
        paid_by_id: paidBy,
      }))
    );

    return c.json(transaction);
  } catch (error) {
    console.error(`${error}`);

    return c.text("Something went wrong", 500);
  }
});

transactions.get("/:userId", async (c) => {
  const userId = c.req.param("userId");

  const transactions = await db.query.usersToTransactions
    .findMany({
      where: eq(usersToTransactions.user_id, userId),
      with: {
        transaction: {
          with: {
            paidBy: true,
            userExpenses: {
              where: or(
                and(
                  eq(userExpenses.paid_by_id, userId),
                  eq(userExpenses.settled, false)
                ),
                and(
                  eq(userExpenses.user_id, userId),
                  eq(userExpenses.settled, false)
                )
              ),
            },
          },
        },
      },
    })
    .then((data) => {
      return data
        .filter((usersToTransactions) => {
          if (usersToTransactions.transaction.userExpenses.length === 0)
            return false;

          return true;
        })
        .map((usersToTransactions) => {
          return {
            ...usersToTransactions.transaction,
          };
        });
    });

  return c.json(transactions);
});

transactions.get("/:userId/summary", async (c) => {
  const userId = c.req.param("userId");

  const transactions = await db.query.usersToTransactions
    .findMany({
      where: eq(usersToTransactions.user_id, userId),
      with: {
        transaction: {
          with: {
            userExpenses: true,
          },
        },
      },
    })
    .then((data) => {
      return data.map((usersToTransactions) => {
        if (usersToTransactions.transaction.paid_by_id === userId) {
          return {
            ...usersToTransactions.transaction,
            paid: usersToTransactions.transaction.userExpenses.reduce(
              (acc, expense) => {
                return acc + parseFloat(expense.owed);
              },
              0
            ),
            owed: 0,
          };
        }

        return {
          ...usersToTransactions.transaction,
          owed: usersToTransactions.transaction.userExpenses.reduce(
            (acc, expense) => {
              if (expense.user_id === userId) {
                return acc + parseFloat(expense.owed);
              } else {
                return acc;
              }
            },
            0
          ),
          paid: usersToTransactions.transaction.userExpenses.reduce(
            (acc, expense) => {
              if (expense.user_id === userId) {
                return acc + parseFloat(expense.paid);
              } else {
                return acc;
              }
            },
            0
          ),
        };
      });
    });

  const summary = transactions.reduce(
    (acc, transaction) => {
      if (transaction.paid) {
        acc.paid += transaction.paid;
      } else {
        acc.owed += transaction.owed;
      }

      return acc;
    },
    { paid: 0, owed: 0 }
  );

  return c.json(summary);
});

transactions.get("/:transactionId/details", async (c) => {
  const transactionId = c.req.param("transactionId");
  const clerkClient = c.get("clerk");

  const transaction = await db.query.transactions
    .findFirst({
      where: eq(transactionsTable.id, transactionId),
      with: {
        users: {
          with: {
            user: true,
          },
        },
        userExpenses: true,
      },
    })
    .then((data) => {
      return {
        ...data,
        userExpenses: data?.userExpenses.map((userExpense) => {
          return {
            ...userExpense,
            settled: Number(userExpense.settled) > 0,
          };
        }),
      };
    });

  const usersToTransactionsWithImages = [];

  for (const user of transaction.users || []) {
    const userWithImage = await clerkClient.users.getUser(user.user.clerk_id);
    usersToTransactionsWithImages.push({
      user: {
        ...user.user,
        image: userWithImage.imageUrl,
      },
    });
  }

  return c.json({
    ...transaction,
    users: usersToTransactionsWithImages,
  });
});

transactions.get("/:userId/:transactionId", async (c) => {
  const userId = c.req.param("userId");
  const transactionId = c.req.param("transactionId");

  const transaction = await db.query.transactions
    .findFirst({
      where: eq(transactionsTable.id, transactionId),
      with: {
        userExpenses: {
          where: eq(userExpenses.user_id, userId),
        },
        paidBy: {
          with: {
            qrCodes: true,
          },
        },
      },
    })
    .then((data) => {
      if (!data) return {};

      return {
        ...data,
        owed: data.userExpenses.reduce((acc, expense) => {
          return acc + parseFloat(expense.owed);
        }, 0),
        settled: data.userExpenses.every((userExpense) => {
          return userExpense.settled.toString() === "1";
        }),
      };
    });

  return c.json(transaction);
});

transactions.post("/:userId/:transactionId/settle", async (c) => {
  const userId = c.req.param("userId");
  const transactionId = c.req.param("transactionId");

  const transaction = await db
    .update(userExpenses)
    .set({
      settled: true,
      paid: "0",
      owed: "0",
    })
    .where(
      and(
        eq(userExpenses.user_id, userId),
        eq(userExpenses.transaction_id, transactionId)
      )
    );

  return c.json(transaction);
});

export default transactions;
