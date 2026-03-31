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

    const { jobPosition, jobDesc, jobExperience, resumeText, questionType, questionCount, createdBy, persona } = body;

    // 🔍 DEBUG: Check DB URL
    console.log("DB URL:", process.env.DATABASE_URL);

    // ✅ Prompt for AI
    const prompt = `
You are an advanced AI Mock Interview Generator designed to create highly relevant and tailored interview questions.

---

### INPUT PARAMETERS:
- Job Role: ${jobPosition}
- Job Description / Tech Stack: ${jobDesc}
- Experience Level: ${jobExperience}
- Resume File (optional): ${resumeText ? resumeText : "Not Provided"}
- Question Mode: ${questionType || "Both (Hybrid Intelligent Mode)"}
- Number of Questions: ${questionCount || 5}
- Interviewer Persona: ${persona || "Standard"}

---

### CORE LOGIC:

1. Resume is OPTIONAL:
   - If no resume file is uploaded:
     → Automatically default to "General" question generation.
     → Ignore Resume-Based and Both modes even if selected.

2. If resume is uploaded:
   - Use extracted {resumeContent} for generating questions.

3. Question Mode Behavior:
   A. "General":
      - Generate questions using job role, tech stack, and experience.
      - Use modern, industry-relevant, and technically rich terminology.
   B. "Resume-Based":
      - Generate questions strictly from resume content.
      - Focus on: Projects, Tech stack, Tools, Real-world implementations, Problem-solving scenarios.
   C. "Both (Hybrid Intelligent Mode)":
      - Combine resume-driven and general questions.
      - Maintain a balanced distribution.
      - Blend theoretical + practical + experience-based questions.

4. INTERVIEWER PERSONA BEHAVIOR:
   - You MUST act as the specified persona: "${persona || "Standard"}".
   - If "Strict Technical Lead", ask deep dive edge cases, trade-offs, and be highly scrutinizing.
   - If "Friendly HR Manager", focus on cultural fit, teamwork, and ask questions with an encouraging tone.
   - If "Startup Founder", focus on speed, execution, product mindsets, and moving fast.
   - Your generated questions should reflect this tone explicitly.

---

### ADVANCED QUESTION GENERATION RULES:
- Total questions MUST exactly match ${questionCount || 5}.
- Maintain progressive difficulty: Easy → Medium → Advanced.
- Use high-quality, industry-level phrasing such as:
  • "Explain your approach to..."
  • "How would you optimize..."
  • "Describe a scenario where..."
  • "What trade-offs would you consider..."
  • "How do you architect..."
- Include: Technical questions, Scenario-based questions, Behavioral questions (if relevant).
- Questions should feel like they are asked by real interviewers at top tech companies.

---

### STRICT RULES:
- Do NOT generate answers.
- Do NOT mention resume explicitly in questions.
- Keep questions concise but meaningful.
- Avoid repetition.

---

### OUTPUT FORMAT (STRICT JSON ONLY):
{
  "questions": [
    {
      "question": "..."
    },
    {
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

    console.log("🧠 AI RAW:", text);

    let questions = [];

    try {
      const cleanedText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error("Could not find JSON object in AI response");
      }

      let parsed = JSON.parse(jsonMatch[0]);
      questions = parsed?.questions || parsed?.mockInterviewQuestion || [];
      
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("AI response did not contain a valid 'questions' array");
      }
    } catch (err) {
      console.log("⚠️ Parse failed, using fallback:", err.message);

      questions = Array.from({ length: questionCount || 5 }).map((_, i) => ({
        question: `Fallback Question ${i + 1}: Could you explain a challenging scenario from your experience and how you handled it?`
      }));
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
      resumeText: resumeText || null,
      persona: persona || "Standard",
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