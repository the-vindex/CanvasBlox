import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const levels = pgTable("levels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLevelSchema = createInsertSchema(levels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertLevel = z.infer<typeof insertLevelSchema>;
export type Level = typeof levels.$inferSelect;
