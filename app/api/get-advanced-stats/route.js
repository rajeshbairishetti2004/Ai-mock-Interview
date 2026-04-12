import { NextResponse } from "next/server";
import { db } from "@/utils/db";
import { MockInterview, UserAnswer } from "@/utils/schema";
import { eq } from "drizzle-orm";

const FILLER_WORDS = ["um", "uh", "like", "literally", "basically", "you know", "right", "so yeah"];

// Simple naive logic to parse filler words
function countFillerWords(text) {
  if (!text) return 0;
  const lowerText = text.toLowerCase();
  let count = 0;
  FILLER_WORDS.forEach(word => {
    // Regex for exact word boundaries
    const matches = lowerText.match(new RegExp(`\\b${word}\\b`, 'gi'));
    if (matches) {
      count += matches.length;
    }
  });
  return count;
}

// Communication score calculation based on length and filler usage
function calculateCommunicationScore(text, fillerCount, technicalRating) {
  if (!text || text.length < 20) return Math.min(technicalRating, 4); // Too short
  
  let score = 8; // Base
  if (text.length > 300) score += 1;
  if (text.length > 500) score += 1;
  
  // Penalize for filler words
  if (fillerCount > 2) score -= 1;
  if (fillerCount > 5) score -= 1;
  if (fillerCount > 10) score -= 2;
  
  // Constrain between 1 and 10
  score = Math.max(1, Math.min(10, score));
  return score;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Join UserAnswer and MockInterview
    const answers = await db
      .select({
        id: UserAnswer.id,
        userAns: UserAnswer.userAns,
        rating: UserAnswer.rating,
        createdAt: UserAnswer.createdAt,
        jobPosition: MockInterview.jobPosition,
      })
      .from(UserAnswer)
      .leftJoin(MockInterview, eq(UserAnswer.mockIdRef, MockInterview.mockId))
      .where(eq(UserAnswer.userEmail, email));

    // Process Analytics
    let totalFillerWords = 0;
    const categoryMap = {}; 
    
    let totalTechScore = 0;
    let totalCommScore = 0;
    let validAnswers = 0;

    answers.forEach(ans => {
      const techRating = parseInt(ans.rating) || 5;
      const fillerCount = countFillerWords(ans.userAns);
      const commRating = calculateCommunicationScore(ans.userAns, fillerCount, techRating);
      
      totalFillerWords += fillerCount;
      totalTechScore += techRating;
      totalCommScore += commRating;
      validAnswers += 1;

      // Group by category (Job Position)
      let category = ans.jobPosition || "General";
      // Clean long specific job titles into shorter categories
      
      if (!categoryMap[category]) {
        categoryMap[category] = { sumTech: 0, sumComm: 0, count: 0 };
      }
      categoryMap[category].sumTech += techRating;
      categoryMap[category].sumComm += commRating;
      categoryMap[category].count += 1;
    });

    // Formatting output for Recharts
    const averageTechScore = validAnswers ? Math.round((totalTechScore / validAnswers) * 10) / 10 : 0;
    const averageCommScore = validAnswers ? Math.round((totalCommScore / validAnswers) * 10) / 10 : 0;
    
    // Category Breakdown Chart Data
    const categoryChartData = Object.keys(categoryMap).map(key => ({
      name: key.length > 15 ? key.substring(0, 15) + "..." : key, 
      Technical: Math.round((categoryMap[key].sumTech / categoryMap[key].count) * 10) / 10,
      Communication: Math.round((categoryMap[key].sumComm / categoryMap[key].count) * 10) / 10,
    })).slice(0, 6); // Take top 6 categories to prevent squished chart

    // Radar Chart Data (Overview split) scaled to 100
    const radarChartData = [
      { subject: 'Technical skills', A: Math.round(averageTechScore * 10), fullMark: 100 },
      { subject: 'Communication', A: Math.round(averageCommScore * 10), fullMark: 100 },
      { subject: 'Clarity', A: Math.round(((averageTechScore + averageCommScore) / 2) * 10), fullMark: 100 },
      { subject: 'Depth', A: Math.round(Math.max(1, averageTechScore - 0.5) * 10), fullMark: 100 },
      { subject: 'Confidence', A: Math.round(Math.max(1, averageCommScore - 0.5) * 10), fullMark: 100 }
    ];

    return NextResponse.json({
      success: true,
      data: {
        totalFillerWords,
        averageTechScore,
        averageCommScore,
        categoryChartData,
        radarChartData,
        totalAnswers: validAnswers
      }
    });

  } catch (error) {
    console.error("❌ ADVANCED STATS ERROR", error);
    return NextResponse.json({ error: "Failed to fetch advanced stats" }, { status: 500 });
  }
}
