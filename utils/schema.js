import { serial, text, varchar, pgTable, integer } from "drizzle-orm/pg-core";

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
  resumeText: text("resumeText"),
  resumeAnalysis: text("resumeAnalysis"),
  persona: varchar("persona").default("Standard"),
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

/* ---------------- USER STATS (GAMIFICATION) TABLE ---------------- */

export const UserStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userEmail: varchar("userEmail").notNull(),
  totalInterviews: integer("totalInterviews").default(0),
  currentStreak: integer("currentStreak").default(0),
  longestStreak: integer("longestStreak").default(0),
  totalPoints: integer("totalPoints").default(0),
  lastInterviewDate: varchar("lastInterviewDate"),
});