import { NextResponse } from "next/server";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const { mockId } = body;

    if (!mockId) {
      return NextResponse.json(
        { success: false, error: "mockId is required" },
        { status: 400 }
      );
    }

    // 1. Fetch Interview Data
    const result = await db
      .select()
      .from(MockInterview)
      .where(eq(MockInterview.mockId, mockId));

    if (!result || result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Interview not found" },
        { status: 404 }
      );
    }

    const interviewData = result[0];

    if (!interviewData.resumeText) {
      return NextResponse.json(
        { success: false, error: "No resume provided for this interview" },
        { status: 400 }
      );
    }

    // 2. Check if analysis already exists (Cache)
    if (interviewData.resumeAnalysis) {
      return NextResponse.json({
        success: true,
        data: JSON.parse(interviewData.resumeAnalysis),
      });
    }

    // 3. Prompt AI for analysis
    const prompt = `
You are an expert technical recruiter and resume reviewer.
Analyze the following candidate's resume against their target Job Role and Job Description.

Target Job Role: ${interviewData.jobPosition}
Job Description: ${interviewData.jobDesc}
Years of Experience Expected: ${interviewData.jobExperience}

Candidate's Resume:
${interviewData.resumeText}

Identify specific skill gaps (what the job needs vs what the resume lacks).
Provide actionable improvement suggestions for the resume layout, phrasing, or content.

Return ONLY a JSON object in this exact format, with no markdown formatting outside of the JSON text:
{
  "generalFeedback": "A short summary of the resume's quality",
  "skillGaps": [
    { "skill": "React.js", "description": "Candidate lacks demonstrable React experience mentioned in job desc" }
  ],
  "improvementSuggestions": [
    "Use strong action verbs in bullet points",
    "Quantify your achievements"
  ],
  "overallFitScore": number (0 to 100)
}
    `;

    const chat = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.3,
    });

    let text = chat?.choices?.[0]?.message?.content || "";

    // Clean JSON response
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    let analysisData;
    try {
      analysisData = JSON.parse(text);
    } catch (parseError) {
      console.error("❌ JSON Parse error for resume analysis", text);
      return NextResponse.json(
        { success: false, error: "AI returned invalid response" },
        { status: 500 }
      );
    }

    // 4. Save to Database
    await db
      .update(MockInterview)
      .set({ resumeAnalysis: JSON.stringify(analysisData) })
      .where(eq(MockInterview.mockId, mockId));

    return NextResponse.json({
      success: true,
      data: analysisData,
    });
  } catch (error) {
    console.error("❌ Resume Analysis API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to analyze resume" },
      { status: 500 }
    );
  }
}
