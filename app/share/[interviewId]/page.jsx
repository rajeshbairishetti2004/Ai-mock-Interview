"use client";

import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { eq } from "drizzle-orm";
import React, { useEffect, useState, useMemo } from "react";
import { ChevronDown, Share2, ShieldQuestion } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SharedInterviewFeedback({ params }) {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GetFeedback();
  }, [params.interviewId]);

  const GetFeedback = async () => {
    try {
      const result = await db
        .select()
        .from(UserAnswer)
        .where(eq(UserAnswer.mockIdRef, params.interviewId));

      setFeedbackList(result);
    } catch (error) {
      console.error("DB ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-20 font-sans selection:bg-purple-500/30">
      <div className="max-w-4xl mx-auto">
        {/* Header / Brand */}
        <div className="flex items-center gap-2 mb-10 pb-6 border-b border-white/10">
          <ShieldQuestion className="w-8 h-8 text-purple-400" />
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
            Anonymous Interview Review
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <span className="relative flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-purple-500"></span>
            </span>
          </div>
        ) : feedbackList.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
            <h2 className="font-bold text-xl text-gray-400">
              No interview record found.
            </h2>
            <p className="text-sm text-gray-500 mt-2">The link might be invalid or the interview was empty.</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-10 p-8 rounded-2xl bg-gradient-to-r from-purple-900/40 to-blue-900/20 border border-white/10">
              <h2 className="text-3xl font-extrabold mb-2 text-white">
                Candidate Performance Overview
              </h2>
              <p className="text-gray-400 mb-6 font-light">
                This is a shared read-only report. Personal candidate information is hidden to ensure privacy.
              </p>
              
              <div className="flex items-center gap-4 bg-black/40 w-fit px-6 py-4 rounded-xl border border-white/5">
                <span className="text-gray-300">Overall Rating:</span>
                <strong className={`text-4xl font-black ${overallRating >= 6 ? 'text-green-400' : 'text-red-400'}`}>
                  {overallRating} <span className="text-xl text-gray-500">/ 10</span>
                </strong>
              </div>
            </div>

            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-gray-400" /> Responses & AI Feedback
            </h3>

            <div className="flex flex-col gap-4">
              {feedbackList.map((item, index) => (
                <Collapsible key={index} className="group">
                  <CollapsibleTrigger className="p-5 bg-white/5 hover:bg-white/10 transition-colors rounded-xl flex justify-between items-center w-full border border-white/5 data-[state=open]:rounded-b-none data-[state=open]:border-b-transparent">
                    <span className="font-medium text-left text-gray-200">
                      <span className="text-blue-400 font-mono mr-2">Q{index + 1}.</span> 
                      {item.question}
                    </span>
                    <ChevronDown className="h-5 w-5 text-gray-400 group-data-[state=open]:rotate-180 transition-transform" />
                  </CollapsibleTrigger>

                  <CollapsibleContent className="bg-white/[0.02] border border-white/5 border-t-0 p-5 rounded-b-xl">
                    <div className="flex flex-col gap-4 text-sm">
                      <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <strong className="text-yellow-400 block mb-1">AI Rating</strong>
                        <span className="text-yellow-200 font-mono text-lg">{item.rating || "N/A"} / 10</span>
                      </div>

                      <div className="p-4 rounded-lg bg-gray-500/10 border border-gray-500/20">
                        <strong className="text-gray-400 block mb-1">Candidate's Answer</strong>
                        <p className="text-gray-200 leading-relaxed font-light">{item.userAns || "No answer provided."}</p>
                      </div>

                      {item.correctAns && (
                        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                          <strong className="text-green-400 block mb-1">Ideal Answer (AI Suggested)</strong>
                          <p className="text-green-100 leading-relaxed font-light">{item.correctAns}</p>
                        </div>
                      )}

                      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <strong className="text-blue-400 block mb-1">AI Feedback & Improvements</strong>
                        <p className="text-blue-100 leading-relaxed font-light">{item.feedback || "No feedback."}</p>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Link href="/">
                <button className="bg-white/10 hover:bg-white/20 border border-white/20 px-8 py-3 rounded-full text-white transition-all">
                  Create Your Own Mock Interview
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
