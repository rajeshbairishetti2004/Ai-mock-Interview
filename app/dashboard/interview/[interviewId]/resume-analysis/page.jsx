"use client";

import React, { useEffect, useState } from "react";
import { LoaderCircle, Briefcase, FileText, TrendingUp, AlertTriangle, CheckCircle2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";

const ResumeAnalysisPage = ({ params }) => {
  const mockId = params.interviewId;
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async () => {
    try {
      const res = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mockId })
      });
      const data = await res.json();
      if (data.success) {
        setAnalysis(data.data);
      } else {
        toast.error(data.error || "Failed finding resume data.");
      }
    } catch (error) {
      toast.error("Failed to fetch resume analysis");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-white">
        <div className="relative">
          <div className="absolute inset-0 bg-purple-500 blur-[50px] opacity-40 rounded-full h-32 w-32 animate-pulse"></div>
          <LoaderCircle size={80} className="animate-spin text-cyan-400 relative z-10 mb-6 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent animate-pulse">
          Analyzing your resume...
        </h2>
        <p className="text-gray-400 mt-3 text-lg">Our AI is comparing your experience against the job description.</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
        <AlertTriangle size={64} className="text-red-400 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Analysis Failed</h2>
        <Link href={`/dashboard/interview/${mockId}`}>
          <Button variant="outline">Back to Interview</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white pt-10 pb-20 px-4 md:px-10 max-w-6xl mx-auto">
      
      {/* HEADER SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="flex mb-10 items-center justify-between"
      >
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-500 bg-clip-text text-transparent mb-3">
            Resume Analysis Report
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl leading-relaxed">
            {analysis.generalFeedback}
          </p>
        </div>
        
        <Link href={`/dashboard/interview/${mockId}`}>
          <Button className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all shadow-lg hover:shadow-cyan-500/20">
            <ChevronLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: OVERALL SCORE & SUGGESTIONS */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* SCORE CARD */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.37)] relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-700"></div>
            
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-200">
              <TrendingUp className="text-cyan-400" /> Overall Fit Score
            </h3>
            
            <div className="flex items-center justify-center mt-4 mb-2">
              <div className="relative flex items-center justify-center h-48 w-48 rounded-full border-[8px] border-white/5 shadow-[0_0_30px_rgba(34,211,238,0.2)_inset]"
                style={{
                  background: `conic-gradient(from 0deg, #22d3ee ${analysis.overallFitScore}%, transparent ${analysis.overallFitScore}%, transparent 100%)`
                }}
              >
                <div className="absolute h-40 w-40 rounded-full bg-[#0m2b57] bg-opacity-90 backdrop-blur-md flex flex-col items-center justify-center shadow-2xl">
                   <span className="text-5xl font-black bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent drop-shadow-lg">
                     {analysis.overallFitScore}%
                   </span>
                </div>
              </div>
            </div>
            
            <p className="text-center text-sm mt-6 text-gray-400">
              {analysis.overallFitScore > 80 ? "Excellent Fit!" : analysis.overallFitScore > 60 ? "Good Fit, but room for improvement." : "Significant gaps identified."}
            </p>
          </motion.div>

          {/* IMPROVEMENT SUGGESTIONS */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-[#2e1065]/60 to-[#1e1b4b]/60 backdrop-blur-xl p-8 shadow-[0_8px_30px_rgba(168,85,247,0.2)]"
          >
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 text-purple-300">
              <FileText className="text-purple-400" /> Improvement Tips
            </h3>
            
            <ul className="space-y-4">
              {analysis.improvementSuggestions?.map((tip, index) => (
                <li key={index} className="flex gap-3 items-start bg-white/5 p-4 rounded-xl border border-white/5 hover:border-purple-400/50 transition-colors">
                  <CheckCircle2 className="text-green-400 mt-1 flex-shrink-0" size={18} />
                  <span className="text-gray-200 leading-snug">{tip}</span>
                </li>
              ))}
            </ul>
          </motion.div>

        </div>

        {/* RIGHT COLUMN: SKILL GAPS */}
        <div className="lg:col-span-2">
           <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.5, delay: 0.2 }}
            className="h-full rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-[#082f49]/80 to-[#172554]/80 backdrop-blur-xl p-8 shadow-[0_8px_30px_rgba(6,182,212,0.15)]"
          >
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-cyan-300 border-b border-cyan-500/20 pb-4">
              <Briefcase className="text-cyan-400" size={28} /> Skill Gap Analysis
            </h3>
            
            <div className="space-y-6">
              {analysis.skillGaps?.length > 0 ? (
                analysis.skillGaps.map((gap, index) => (
                  <div key={index} className="group flex flex-col md:flex-row gap-4 bg-black/40 p-6 rounded-2xl border border-white/5 hover:bg-black/60 hover:border-cyan-500/40 transition-all duration-300 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-orange-500 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-300"></div>
                    
                    <div className="min-w-[150px]">
                      <h4 className="font-bold text-red-400 text-lg flex items-center gap-2">
                        <AlertTriangle size={16} />
                        {gap.skill}
                      </h4>
                    </div>
                    <div>
                      <p className="text-gray-300 leading-relaxed text-md">{gap.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-6 rounded-xl text-center">
                  <CheckCircle2 size={40} className="mx-auto mb-3 opacity-80" />
                  <p className="text-lg">No significant skill gaps found! Your resume matches the job description perfectly.</p>
                </div>
              )}
            </div>

            <div className="mt-10 pt-6 border-t border-white/10 flex justify-end">
                <Link href={`/dashboard/interview/${mockId}/start`}>
                  <Button className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold text-lg py-6 px-10 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all hover:scale-105">
                    Start Interview Now
                  </Button>
                </Link>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default ResumeAnalysisPage;
