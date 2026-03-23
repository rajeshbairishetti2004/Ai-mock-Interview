import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import InterviewClient from "./InterviewClient";

const Interview = async ({ params }) => {

  // ✅ 1. Check params coming from URL
  console.log("PARAMS:", params);

  // ✅ 2. Fetch from DB
  const result = await db
    .select()
    .from(MockInterview)
    .where(eq(MockInterview.mockId, params?.interviewId));

  // ✅ 3. Extract first row
  const interviewData = result[0];

  // ✅ 4. Check if data exists
  console.log("INTERVIEW DATA:", interviewData);

  // ✅ 5. Send to client
  return <InterviewClient interviewData={interviewData} />;
};

export default Interview;