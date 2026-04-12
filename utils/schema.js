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
  persona: varchar("persona", { length: 255 }).default("Standard"),
});

/* ---------------- QUESTION TABLE ---------------- */

export const Question = pgTable("question", {
  id: serial("id").primaryKey(),
  MockQuestionJsonResp: text("MockQuestionJsonResp").notNull(),
  jobPosition: text("jobPosition").notNull(),
  jobDesc: text("jobDesc").notNull(),
  jobExperience: text("jobExperience").notNull(),
  typeQuestion: varchar("typeQuestion").notNull(),
  company: varchar("company").notNull(),
  createdBy: text("createdBy").notNull(),
  createdAt: text("createdAt"),
  mockId: text("mockId").notNull(),
});

/* ---------------- USER ANSWERS TABLE ---------------- */

export const UserAnswer = pgTable("user_answer", {
  id: serial("id").primaryKey(),
  mockIdRef: text("mockIdRef").notNull(),
  question: text("question").notNull(),
  correctAns: text("correctAns"),
  userAns: text("userAns"),
  feedback: text("feedback"),
  rating: text("rating"),
  userEmail: text("userEmail"),
  createdAt: text("createdAt"),
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
  userEmail: varchar("userEmail", { length: 255 }).notNull(),
  totalInterviews: integer("totalInterviews").default(0),
  currentStreak: integer("currentStreak").default(0),
  longestStreak: integer("longestStreak").default(0),
  totalPoints: integer("totalPoints").default(0),
  lastInterviewDate: varchar("lastInterviewDate", { length: 255 }),
});

/* ---------------- MULTIPLAYER LOBBY TABLE ---------------- */

export const MultiplayerLobby = pgTable("multiplayer_lobby", {
  id: serial("id").primaryKey(),
  roomId: varchar("roomId").notNull().unique(), // Link parameter for sharing
  mockIdRef: varchar("mockIdRef").notNull(), // The generated MockInterview logic
  hostEmail: varchar("hostEmail").notNull(),
  guestEmail: varchar("guestEmail"),
  gameState: varchar("gameState").default("waiting"), // waiting, active, finished
  turn: varchar("turn").default("host"), // Current player allowed to answer
  hostScore: integer("hostScore").default(0),
  guestScore: integer("guestScore").default(0),
  createdAt: varchar("createdAt"),
});