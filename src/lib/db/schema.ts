import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createId } from "./cuid";

// -----------------------------------------------------------------------
// Expense Tracker schema (Drizzle ORM, targets PostgreSQL / Neon).
//
// Mirrors the data model in the architecture roadmap (sections 6-11).
// Money columns are `decimal(14,2)` in the database — the domain layer
// (src/lib/domain) converts to/from integer cents so arithmetic never
// touches floating point. See README.md for why Drizzle was chosen over
// Prisma for this project (the roadmap allows either).
// -----------------------------------------------------------------------

export const accountTypeEnum = pgEnum("account_type", [
  "CASH",
  "BANK",
  "EWALLET",
  "SAVINGS",
  "CREDIT_CARD",
  "OTHER",
]);

export const transactionTypeEnum = pgEnum("transaction_type", ["INCOME", "EXPENSE", "TRANSFER"]);

export const categoryTypeEnum = pgEnum("category_type", ["INCOME", "EXPENSE"]);

export const budgetPeriodEnum = pgEnum("budget_period", ["MONTHLY", "WEEKLY", "YEARLY"]);

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(createId),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  currency: text("currency").notNull().default("PHP"),
  timezone: text("timezone").notNull().default("Asia/Manila"),
  themeMode: text("theme_mode").notNull().default("system"),
  accentColor: text("accent_color").notNull().default("emerald"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: accountTypeEnum("type").notNull(),
    currency: text("currency").notNull().default("PHP"),
    initialBalance: decimal("initial_balance", { precision: 14, scale: 2 }).notNull().default("0"),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("accounts_user_id_idx").on(table.userId),
  }),
);

export const categories = pgTable(
  "categories",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: categoryTypeEnum("type").notNull(),
    icon: text("icon").notNull().default("circle"),
    color: text("color").notNull().default("slate"),
    parentId: text("parent_id"),
    isArchived: boolean("is_archived").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("categories_user_id_idx").on(table.userId),
  }),
);

export const transactions = pgTable(
  "transactions",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: text("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
    type: transactionTypeEnum("type").notNull(),
    amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("PHP"),
    transactionDate: timestamp("transaction_date").notNull(),
    description: text("description"),
    notes: text("notes"),
    merchant: text("merchant"),
    // TRANSFER rows only: accountId is the source, transferAccountId the destination.
    transferAccountId: text("transfer_account_id").references(() => accounts.id),
    recurringTransactionId: text("recurring_transaction_id"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userDateIdx: index("transactions_user_id_transaction_date_idx").on(
      table.userId,
      table.transactionDate,
    ),
    accountIdx: index("transactions_account_id_idx").on(table.accountId),
    categoryIdx: index("transactions_category_id_idx").on(table.categoryId),
    transferAccountIdx: index("transactions_transfer_account_id_idx").on(table.transferAccountId),
  }),
);

export const budgets = pgTable(
  "budgets",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
    amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
    period: budgetPeriodEnum("period").notNull().default("MONTHLY"),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("budgets_user_id_idx").on(table.userId),
  }),
);

export const recurringTransactions = pgTable(
  "recurring_transactions",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: text("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
    type: transactionTypeEnum("type").notNull(),
    amount: decimal("amount", { precision: 14, scale: 2 }).notNull(),
    merchant: text("merchant"),
    frequency: text("frequency").notNull(),
    nextRunAt: timestamp("next_run_at").notNull(),
    endDate: timestamp("end_date"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("recurring_transactions_user_id_idx").on(table.userId),
  }),
);

// -- Relations (used by db.query.* for convenient nested reads) --------

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  categories: many(categories),
  transactions: many(transactions),
  budgets: many(budgets),
}));

export const accountsRelations = relations(accounts, ({ one, many }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
  transactions: many(transactions, { relationName: "accountTransactions" }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, { fields: [categories.userId], references: [users.id] }),
  parent: one(categories, { fields: [categories.parentId], references: [categories.id] }),
  children: many(categories),
  transactions: many(transactions),
  budgets: many(budgets),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
    relationName: "accountTransactions",
  }),
  transferAccount: one(accounts, {
    fields: [transactions.transferAccountId],
    references: [accounts.id],
  }),
  category: one(categories, { fields: [transactions.categoryId], references: [categories.id] }),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  user: one(users, { fields: [budgets.userId], references: [users.id] }),
  category: one(categories, { fields: [budgets.categoryId], references: [categories.id] }),
}));

export type User = typeof users.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;
