import { NextResponse } from "next/server";
import { db } from "@/utils/db";
import { UserStats } from "@/utils/schema";
import { eq } from "drizzle-orm";
import moment from "moment";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const today = moment().format("YYYY-MM-DD");
    const yesterday = moment().subtract(1, "days").format("YYYY-MM-DD");

    // Check if user exists
    const existingStats = await db
      .select()
      .from(UserStats)
      .where(eq(UserStats.userEmail, email));

    if (existingStats.length === 0) {
      // Create new stats row
      await db.insert(UserStats).values({
        userEmail: email,
        totalInterviews: 1, // Assume an answer counts towards interview activity
        currentStreak: 1,
        longestStreak: 1,
        totalPoints: 10, // 10 points per answer
        lastInterviewDate: today,
      });
    } else {
      const stats = existingStats[0];
      
      let newStreak = stats.currentStreak;
      let newTotalPoints = (stats.totalPoints || 0) + 10;
      let newTotalInterviews = stats.totalInterviews;

      // Handle streaks
      if (stats.lastInterviewDate === yesterday) {
        newStreak += 1; // Continuing streak
      } else if (stats.lastInterviewDate !== today) {
        newStreak = 1; // Broken streak, reset
      }

      const newLongest = Math.max(stats.longestStreak || 0, newStreak);

      await db
        .update(UserStats)
        .set({
          currentStreak: newStreak,
          longestStreak: newLongest,
          totalPoints: newTotalPoints,
          lastInterviewDate: today,
        })
        .where(eq(UserStats.userEmail, email));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ LOG ACTIVITY ERROR", error);
    return NextResponse.json({ error: "Failed to log activity" }, { status: 500 });
  }
}
