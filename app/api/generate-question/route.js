import { NextResponse } from "next/server";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { v4 as uuidv4 } from "uuid";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    const body = await req.json();

    const { jobPosition, jobDesc, jobExperience, createdBy } = body;

    // 🔍 DEBUG: Check DB URL
    console.log("DB URL:", process.env.DATABASE_URL);

    // ✅ Prompt for AI
    const prompt = `
Generate 5 interview questions for:

Job Role: ${jobPosition}
Description: ${jobDesc}
Experience: ${jobExperience} years

Return ONLY JSON array like:
[
  { "question": "..." },
  { "question": "..." }
]

Do NOT add explanation.
Only JSON.
`;

    // ✅ Call Groq AI
    const chat = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant",
    });

    let text = chat.choices[0].message.content;

    console.log("🧠 AI RAW:", text);

    let questions = [];

    try {
      const cleanedText = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      questions = JSON.parse(cleanedText);
    } catch (err) {
      console.log("⚠️ Parse failed, using fallback");

      questions = [
        { question: "Tell me about yourself" },
        { question: "Explain your recent project" },
        { question: "What are your strengths?" },
      ];
    }

    const mockId = uuidv4();

    // 🔍 DEBUG before DB insert
    console.log("Saving to DB...");

    // ✅ Save to DB
    await db.insert(MockInterview).values({
      mockId,
      jobPosition,
      jobDesc,
      jobExperience,
      jsonMockResp: JSON.stringify(questions),
      createdBy,
    });

    console.log("✅ Saved successfully");

    return NextResponse.json({
      success: true,
      mockId,
    });

  } catch (error) {
    console.error("❌ API ERROR:", error);

    return NextResponse.json(
      { error: error.message || "Failed to generate interview" },
      { status: 500 }
    );
  }
}