import { NextResponse } from "next/server";
import { db } from "@/utils/db";
import { UserStats } from "@/utils/schema";
import { eq } from "drizzle-orm";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const stats = await db
      .select()
      .from(UserStats)
      .where(eq(UserStats.userEmail, email));

    if (stats.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          currentStreak: 0,
          longestStreak: 0,
          totalPoints: 0,
          totalInterviews: 0
        }
      });
    }

    return NextResponse.json({ success: true, data: stats[0] });
  } catch (error) {
    console.error("❌ GET STATS ERROR", error);
    return NextResponse.json({ error: "Failed to get stats" }, { status: 500 });
  }
}
