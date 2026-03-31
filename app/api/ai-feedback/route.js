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
    const resumeText = body?.resumeText;

    // ✅ VALIDATION
    if (!question || !userAnswer) {
      return NextResponse.json(
        { success: false, error: "Missing question or userAnswer" },
        { status: 400 }
      );
    }

    // ✅ PROMPT
    const prompt = `
You are an expert AI interviewer evaluating a candidate's response.

Question:
${question}

User Answer:
${userAnswer}

${resumeText ? `Candidate Resume Context:\n${resumeText}\n\nPlease evaluate if the user's answer aligns well with the experience they claimed in their resume.` : ""}

EVALUATION INSTRUCTIONS:
1. Determine if the question is "Behavioral" or "Technical".
2. If it is Behavioral (e.g., "Tell me about a time...", "How did you handle..."), you MUST evaluate their answer using the S.T.A.R. methodology (Situation, Task, Action, Result).
   - Check if they provided a clear Situation/Task.
   - Check if they explained their specific Action.
   - Check if they shared the final Result/Impact.
   - In your feedback, explicitly call out which parts of S.T.A.R. they missed or did well.
3. If it is Technical, evaluate for correctness, efficiency, and clarity.
4. Provide a rating from 0 to 10 based on the quality of the answer.

STRICT RULES:
- Respond ONLY in valid JSON
- Do NOT add explanation outside the JSON format
- Do NOT use markdown code blocks like \`\`\`json

FORMAT:
{
  "correctAnswer": "An ideal, concise example answer (using STAR if behavioral).",
  "feedback": "Detailed, constructive feedback on what was good and what was missing (e.g., 'You forgot to mention the Result').",
  "rating": <number between 0 and 10>
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