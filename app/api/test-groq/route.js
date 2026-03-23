import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function GET() {
  try {
    const chat = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `
Generate 5 interview questions for a React developer.

Return ONLY JSON array like:
[
  { "question": "..." },
  { "question": "..." }
]

Do NOT add explanation.
Only JSON.
`,
        },
      ],
      model: "llama-3.1-8b-instant",
    });

    let text = chat.choices[0].message.content;

    console.log("🧠 RAW RESPONSE:", text);

    let questions = [];

    try {
      // Clean response if wrapped in ```json
      const cleanedText = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      questions = JSON.parse(cleanedText);
    } catch (error) {
      console.log("⚠️ JSON parse failed, using fallback");

      questions = [
        { question: "Tell me about yourself" },
        { question: "What is React?" },
        { question: "Explain useState hook" },
      ];
    }

    return NextResponse.json({
      success: true,
      questions,
    });

  } catch (error) {
    console.log("❌ GROQ ERROR:", error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}