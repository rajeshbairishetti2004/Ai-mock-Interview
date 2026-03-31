import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { eq } from "drizzle-orm";
import StartInterviewClient from "./StartInterviewClient";

const StartInterview = async ({ params }) => {
  const result = await db
    .select()
    .from(MockInterview)
    .where(eq(MockInterview.mockId, params.interviewId));

  const interviewData = result[0];
  let mockInterviewQuestion = JSON.parse(interviewData?.jsonMockResp || "[]");
  if (!Array.isArray(mockInterviewQuestion)) {
    mockInterviewQuestion = mockInterviewQuestion.questions || [];
  }
  console.log("Questions:", mockInterviewQuestion);

  return (
    <StartInterviewClient
      interviewData={interviewData}
      mockInterviewQuestion={mockInterviewQuestion}
    />
  );
};

export default StartInterview;