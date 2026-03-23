import { NextResponse } from "next/server";
import Groq from "groq-sdk";

// ✅ SAFETY CHECK FOR API KEY
if (!process.env.GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY is missing in .env.local");
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    console.log("🔥 API HIT");

    const body = await req.json();
    console.log("📥 API INPUT:", body);

    const question = body?.question;
    const userAnswer = body?.userAnswer;

    // ✅ VALIDATION
    if (!question || !userAnswer) {
      return NextResponse.json(
        { success: false, error: "Missing question or userAnswer" },
        { status: 400 }
      );
    }

    // ✅ PROMPT
    const prompt = `
You are an AI interviewer.

Question:
${question}

User Answer:
${userAnswer}

STRICT RULES:
- Respond ONLY in valid JSON
- Do NOT add explanation
- Do NOT use markdown

FORMAT:
{
  "correctAnswer": "short ideal answer",
  "feedback": "constructive feedback",
  "rating": number (0 to 10)
}
`;

    let chat;

    try {
      chat = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",       
        temperature: 0.3,
      });
    } catch (groqError) {
      console.error("❌ GROQ ERROR:", groqError);

      return NextResponse.json(
        {
          success: false,
          error: "Groq API failed (check API key or quota)",
        },
        { status: 500 }
      );
    }

    let text = chat?.choices?.[0]?.message?.content || "";

    console.log("🤖 RAW AI RESPONSE:", text);

    // ❌ EMPTY RESPONSE FIX
    if (!text || text.length < 5) {
      return NextResponse.json(
        { success: false, error: "Empty AI response" },
        { status: 500 }
      );
    }

    // ✅ CLEAN RESPONSE
    text = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let data;

    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("❌ JSON PARSE ERROR:", text);

      // ✅ FALLBACK RESPONSE (VERY IMPORTANT)
      data = {
        correctAnswer: "Sample correct answer not available",
        feedback: "AI response format issue. Try again.",
        rating: 5,
      };
    }

    // ✅ FINAL RESPONSE
    return NextResponse.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error("❌ FINAL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "AI failed",
      },
      { status: 500 }
    );
  }
}