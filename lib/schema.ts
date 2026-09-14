import { boolean, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const todos = pgTable(
  'todos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id').notNull(),
    title: text('title').notNull(),
    note: text('note'),
    done: boolean('done').notNull().default(false),
    priority: text('priority', { enum: ['low', 'medium', 'high'] }).notNull().default('medium'),
    dueDate: timestamp('due_date', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('idx_todos_user_id').on(t.userId), index('idx_todos_user_done').on(t.userId, t.done)],
);

export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
