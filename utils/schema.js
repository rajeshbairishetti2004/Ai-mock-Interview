import { serial, text, varchar, pgTable } from "drizzle-orm/pg-core";

/* ---------------- MOCK INTERVIEW TABLE ---------------- */

export const MockInterview = pgTable("mock_interview", {
  id: serial("id").primaryKey(),
  jsonMockResp: text("jsonMockResp").notNull(),
  jobPosition: varchar("jobPosition").notNull(),
  jobDesc: varchar("jobDesc").notNull(),
  jobExperience: varchar("jobExperience").notNull(),
  createdBy: varchar("createdBy").notNull(),
  createdAt: varchar("createdAt"),
  mockId: varchar("mockId").notNull(),
});

/* ---------------- QUESTION TABLE ---------------- */

export const Question = pgTable("question", {
  id: serial("id").primaryKey(),
  MockQuestionJsonResp: text("MockQuestionJsonResp").notNull(),
  jobPosition: varchar("jobPosition").notNull(),
  jobDesc: varchar("jobDesc").notNull(),
  jobExperience: varchar("jobExperience").notNull(),
  typeQuestion: varchar("typeQuestion").notNull(),
  company: varchar("company").notNull(),
  createdBy: varchar("createdBy").notNull(),
  createdAt: varchar("createdAt"),
  mockId: varchar("mockId").notNull(),
});

/* ---------------- USER ANSWERS TABLE ---------------- */

export const UserAnswer = pgTable("user_answer", {
  id: serial("id").primaryKey(),
  mockIdRef: varchar("mockIdRef").notNull(),
  question: varchar("question").notNull(),
  correctAns: text("correctAns"),
  userAns: text("userAns"),
  feedback: text("feedback"),
  rating: varchar("rating"),
  userEmail: varchar("userEmail"),
  createdAt: varchar("createdAt"),
});

/* ---------------- NEWSLETTER TABLE ---------------- */

export const Newsletter = pgTable("newsletter", {
  id: serial("id").primaryKey(),
  newName: varchar("newName"),
  newEmail: varchar("newEmail"),
  newMessage: text("newMessage"),
  createdAt: varchar("createdAt"),
});