import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import { text, sqliteTable, index, primaryKey } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .notNull()
      .$defaultFn(() => createId()),
    clerk_id: text("clerk_id").notNull(),
    name: text("name").notNull(),
    user_code: text("user_code").notNull().unique(),
    email: text("email").notNull().unique(),
    created_at: text("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    nameIdx: index("name_idx").on(table.name),
    idIdx: index("id_idx").on(table.id),
  })
);

export const usersRelations = relations(users, ({ many }) => ({
  groups: many(usersToGroups),
  hatians: many(usersToHatians),
  transactions: many(usersToTransactions),
  expenses: many(userExpenses, { relationName: "user" }),
  paidExpenses: many(userExpenses, { relationName: "paidBy" }),
  qrCodes: many(userQRCodes),
}));

export const insertUserSchema = createInsertSchema(users);
export type InsertUserSchema = z.infer<typeof insertUserSchema>;
export const selectUserSchema = createSelectSchema(users);
export type SelectUserSchema = z.infer<typeof selectUserSchema>;

export const groups = sqliteTable(
  "groups",
  {
    id: text("id")
      .primaryKey()
      .notNull()
      .$defaultFn(() => createId()),
    name: text("name").notNull(),
    created_at: text("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    nameIdx: index("group_name_idx").on(table.name),
    idIdx: index("group_id_idx").on(table.id),
  })
);

export const groupRelations = relations(groups, ({ many }) => ({
  users: many(usersToGroups),
  hatians: many(hatians),
}));

export const usersToGroups = sqliteTable(
  "users_to_groups",
  {
    user_id: text("user_id").notNull(),
    group_id: text("group_id").notNull(),
    created_at: text("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.user_id, table.group_id] }),
  })
);

export const usersToGroupsRelations = relations(usersToGroups, ({ one }) => ({
  group: one(groups, {
    fields: [usersToGroups.group_id],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [usersToGroups.user_id],
    references: [users.id],
  }),
}));

export const hatians = sqliteTable(
  "hatians",
  {
    id: text("id")
      .primaryKey()
      .notNull()
      .$defaultFn(() => createId()),
    name: text("name").notNull(),
    group_id: text("group_id").notNull(),
    created_at: text("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    nameIdx: index("hatian_name_idx").on(table.name),
    idIdx: index("hatian_id_idx").on(table.id),
  })
);

export const hatianRelations = relations(hatians, ({ one, many }) => ({
  users: many(usersToHatians),
  group: one(groups, {
    fields: [hatians.group_id],
    references: [groups.id],
  }),
  transactions: many(transactions),
}));

export const usersToHatians = sqliteTable(
  "users_to_hatians",
  {
    user_id: text("user_id").notNull(),
    hatian_id: text("hatian_id").notNull(),
    created_at: text("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.user_id, table.hatian_id] }),
  })
);

export const usersToHatiansRelations = relations(usersToHatians, ({ one }) => ({
  hatian: one(hatians, {
    fields: [usersToHatians.hatian_id],
    references: [hatians.id],
  }),
  user: one(users, {
    fields: [usersToHatians.user_id],
    references: [users.id],
  }),
}));

export const transactions = sqliteTable(
  "transactions",
  {
    id: text("id")
      .primaryKey()
      .notNull()
      .$defaultFn(() => createId()),
    name: text("name").notNull(),
    amount: text("amount").notNull(),
    paid_by_id: text("paid_by_id").notNull(),
    split_type: text("split_type").notNull(),
    hatian_id: text("hatian_id"),
    created_at: text("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    nameIdx: index("transaction_name_idx").on(table.name),
    idIdx: index("transaction_id_idx").on(table.id),
  })
);

export const transactionRelations = relations(
  transactions,
  ({ one, many }) => ({
    hatian: one(hatians, {
      fields: [transactions.hatian_id],
      references: [hatians.id],
    }),
    paidBy: one(users, {
      fields: [transactions.paid_by_id],
      references: [users.id],
    }),
    users: many(usersToTransactions),
    userExpenses: many(userExpenses),
  })
);

export const usersToTransactions = sqliteTable(
  "users_to_transactions",
  {
    user_id: text("user_id").notNull(),
    transaction_id: text("transaction_id").notNull(),
    created_at: text("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.user_id, table.transaction_id] }),
  })
);

export const usersToTransactionsRelations = relations(
  usersToTransactions,
  ({ one }) => ({
    transaction: one(transactions, {
      fields: [usersToTransactions.transaction_id],
      references: [transactions.id],
    }),
    user: one(users, {
      fields: [usersToTransactions.user_id],
      references: [users.id],
    }),
  })
);

export const userExpenses = sqliteTable(
  "user_expenses",
  {
    user_id: text("user_id").notNull(),
    transaction_id: text("transaction_id").notNull(),
    paid: text("paid").notNull(),
    owed: text("owed").notNull(),
    settled: text("settled").$type<boolean>().notNull().default(false),
    paid_by_id: text("paid_by_id").notNull(),
    created_at: text("created_at")
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.user_id, table.transaction_id] }),
  })
);

export const userExpensesRelations = relations(userExpenses, ({ one }) => ({
  transaction: one(transactions, {
    fields: [userExpenses.transaction_id],
    references: [transactions.id],
  }),
  user: one(users, {
    fields: [userExpenses.user_id],
    references: [users.id],
    relationName: "user",
  }),
  paidBy: one(users, {
    fields: [userExpenses.paid_by_id],
    references: [users.id],
    relationName: "paidBy",
  }),
}));

export const userQRCodes = sqliteTable("user_qr_codes", {
  id: text("id")
    .primaryKey()
    .notNull()
    .$defaultFn(() => createId()),
  user_id: text("user_id").notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  created_at: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const userQRCodeRelations = relations(userQRCodes, ({ one }) => ({
  user: one(users, {
    fields: [userQRCodes.user_id],
    references: [users.id],
  }),
}));
