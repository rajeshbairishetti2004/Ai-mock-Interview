"use client";

import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { eq } from "drizzle-orm";
import React, { useEffect, useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const Feedback = ({ params }) => {
  const router = useRouter();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GetFeedback();
  }, []);

  // ✅ FIXED QUERY
  const GetFeedback = async () => {
    try {
      const result = await db
        .select()
        .from(UserAnswer)
        .where(eq(UserAnswer.mockIdRef, params.interviewId));

      console.log("✅ Feedback:", result);
      setFeedbackList(result);
    } catch (error) {
      console.error("❌ DB ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CALCULATE RATING
  const overallRating = useMemo(() => {
    if (feedbackList.length > 0) {
      const total = feedbackList.reduce(
        (sum, item) => sum + Number(item.rating || 0),
        0
      );
      return (total / feedbackList.length).toFixed(1);
    }
    return 0;
  }, [feedbackList]);

  return (
    <div className="p-10 bg-white min-h-screen">

      {loading ? (
        <h2 className="text-gray-500">Loading feedback...</h2>
      ) : feedbackList.length === 0 ? (
        <h2 className="font-bold text-xl text-gray-500 my-5">
          No Interview feedback Record Found
        </h2>
      ) : (
        <>
          <h2 className="text-3xl font-bold text-green-600">
            🎉 Congratulations
          </h2>

          <h2 className="font-bold text-2xl">
            Here is your interview feedback
          </h2>

          <h2 className="text-lg my-3">
            Your overall interview rating{" "}
            <strong
              className={`${
                overallRating >= 6 ? "text-green-600" : "text-red-600"
              }`}
            >
              {overallRating}
              <span className="text-black"> /10</span>
            </strong>
          </h2>

          <h2 className="text-sm text-gray-500">
            Below are your answers with feedback
          </h2>

          {feedbackList.map((item, index) => (
            <Collapsible key={index} className="mt-5">
              <CollapsibleTrigger className="p-3 bg-gray-200 rounded-lg my-2 text-left flex justify-between items-center w-full text-black">
                {item.question}
                <ChevronDown className="h-5 w-5" />
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="flex flex-col gap-3 p-2">

                  <div className="p-2 border rounded-lg bg-yellow-50 text-black">
                    <strong>Rating:</strong> {item.rating || "N/A"}
                  </div>

                  <div className="p-2 border rounded-lg bg-red-50 text-sm text-red-900">
                    <strong>Your Answer:</strong> {item.userAns || "No answer"}
                  </div>

                  {item.correctAns && (
                    <div className="p-2 border rounded-lg bg-green-50 text-sm text-green-900">
                      <strong>Correct Answer:</strong> {item.correctAns}
                    </div>
                  )}

                  <div className="p-2 border rounded-lg bg-blue-50 text-sm text-blue-900">
                    <strong>Feedback:</strong>{" "}
                    {item.feedback || "No feedback"}
                  </div>

                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </>
      )}

      <div className="mt-10">
        <Button onClick={() => router.replace("/dashboard")}>
          Go Home
        </Button>
      </div>
    </div>
  );
};

export default Feedback;