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

    const prompt = `
You are a highly advanced Executive AI Mock Interview Generator designed to simulate a multi-stage elite tech company interview loop (like Google or FAANG).

---

### INPUT PARAMETERS:
- Job Role: ${jobPosition}
- Tech Stack / Domain: ${jobDesc}
- Experience Level: ${jobExperience}

---

### CORE LOGIC:
You must generate exactly 15 questions, strictly broken down into 3 rounds of 5 questions each.

**Round 1: Behavioral & Cultural Fit** (5 questions)
Focus on teamwork, conflict resolution, leadership, failure, and company culture fit.

**Round 2: Core Technical Knowledge** (5 questions)
Focus on strict theoretical knowledge, system architecture, language-specific quirks, and trade-offs.

**Round 3: Live Problem Solving & Scenarios** (5 questions)
Present complex, high-pressure hypothetical scenarios. E.g., "Our auth service is down in production, how do you debug?" or "Design a schema for X".

---

### STRICT RULES:
- Do NOT generate answers.
- The output MUST exactly match the JSON schema below.
- Each item MUST contain the EXACT "round" name matching the phase it belongs to.

### OUTPUT FORMAT (STRICT JSON ONLY - NO OTHER TEXT):
{
  "questions": [
    {
      "round": "Round 1: Behavioral & Cultural Fit",
      "question": "..."
    },
    {
      "round": "Round 2: Core Technical Knowledge",
      "question": "..."
    },
    {
      "round": "Round 3: Live Problem Solving",
      "question": "..."
    }
  ]
}
`;

    // ✅ Call Groq AI
    const chat = await groq.chat.completions.create({
      messages: [
        {
           role: "system",
           content: "You are a specialized JSON-only generator. You must return ONLY raw valid JSON and absolutely no other text, no markdown formatting, and no conversational text. The JSON must contain a 'questions' array.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" },
    });

    let text = chat.choices[0].message.content;

    let questions = [];

    try {
      const cleanedText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error("Could not find JSON object in AI response");
      }

      let parsed = JSON.parse(jsonMatch[0]);
      questions = parsed?.questions || [];
      
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("AI response did not contain a valid 'questions' array");
      }
    } catch (err) {
      console.log("⚠️ Parse failed:", err.message);
      return NextResponse.json(
        { error: "AI failed to generate a valid loop sequence. Try again." },
        { status: 500 }
      );
    }

    const mockId = uuidv4();

    // ✅ Save to DB (reusing MockInterview structure)
    await db.insert(MockInterview).values({
      mockId,
      jobPosition: jobPosition + " (Campaign Loop)", // Distinguishing it
      jobDesc,
      jobExperience,
      jsonMockResp: JSON.stringify(questions),
      createdBy,
    });

    return NextResponse.json({
      success: true,
      mockId,
    });

  } catch (error) {
    console.error("❌ API ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate interview campaign" },
      { status: 500 }
    );
  }
}
