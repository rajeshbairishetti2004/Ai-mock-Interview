"use client";

import React, { useState, useEffect, useRef } from "react";
import QuestionSection from "./_components/QuestionSection";
import RecordAnswerSection from "./_components/RecordAnswerSection";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, Maximize, AlertOctagon } from "lucide-react";

const StartInterviewClient = ({ interviewData, mockInterviewQuestion }) => {
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const router = useRouter();

  // === SECURITY STATES ===
  const [isSecureMode, setIsSecureMode] = useState(false);
  const [strikes, setStrikes] = useState(0);
  const [showViolation, setShowViolation] = useState(false);
  const isEndingRef = useRef(false);

  // === SECURITY MECHANICS ===
  useEffect(() => {
    // 1. Block Copy, Paste, and Right-Click
    const disableContextMenu = (e) => e.preventDefault();
    const disableCopyPaste = (e) => e.preventDefault();

    document.addEventListener("contextmenu", disableContextMenu);
    document.addEventListener("copy", disableCopyPaste);
    document.addEventListener("paste", disableCopyPaste);

    return () => {
      document.removeEventListener("contextmenu", disableContextMenu);
      document.removeEventListener("copy", disableCopyPaste);
      document.removeEventListener("paste", disableCopyPaste);
    };
  }, []);

  useEffect(() => {
    if (!isSecureMode) return;

    // 2. Detect Tab Switching / Minimizing
    const handleVisibilityChange = () => {
      if (isEndingRef.current) return;
      if (document.hidden) {
        handleViolation();
      }
    };

    // 3. Detect Fullscreen Exit
    const handleFullscreenChange = () => {
      if (isEndingRef.current) return;
      if (!document.fullscreenElement) {
        handleViolation();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isSecureMode, strikes]); // Update when strikes change to avoid stale closure

  const handleViolation = () => {
    const newStrikes = strikes + 1;
    setStrikes(newStrikes);
    setShowViolation(true);

    if (newStrikes >= 3) {
      // Strike 3: Forcefully end interview immediately
      alert("❌ MAXIMUM VIOLATIONS REACHED. INTERVIEW TERMINATED.");
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.log(err));
      }
      router.replace(`/dashboard/interview/${interviewData?.mockId}/feedback`);
    } else {
      // Put them back in fullscreen if they exited
      if (!document.fullscreenElement && newStrikes < 3) {
        document.documentElement.requestFullscreen().catch((err) => console.log(err));
      }
    }
  };

  const enterSecureMode = () => {
    document.documentElement.requestFullscreen().then(() => {
      setIsSecureMode(true);
    }).catch((err) => {
      alert("You must allow fullscreen to take this interview.");
      console.log(err);
    });
  };

  // === RENDERING ===

  // Security Wall
  if (!isSecureMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-5">
        <ShieldAlert className="w-24 h-24 text-red-500 mb-5 animate-pulse" />
        <h1 className="text-3xl font-bold text-white mb-3">Secure Exam Mode Required</h1>
        <p className="text-gray-400 max-w-lg mb-8">
          This interview strictly monitors for cheating. <strong className="text-red-400">Copy/Pasting and Right-Clicking are disabled.</strong> If you switch tabs, exit fullscreen, or minimize the browser, you will receive a strike. <br/><br/><strong>3 Strikes = Immediate Termination.</strong>
        </p>
        <Button onClick={enterSecureMode} className="bg-red-600 hover:bg-red-700 text-white font-bold py-6 px-10 rounded-full text-lg shadow-[0_0_40px_rgba(220,38,38,0.5)] transition-all">
          <Maximize className="mr-2 h-6 w-6" /> I Understand, Enter Secure Mode
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      
      {/* 🔴 VIOLATION OVERLAY */}
      {showViolation && strikes < 3 && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-red-950/95 backdrop-blur-xl transition-all">
          <AlertOctagon className="w-32 h-32 text-red-500 mb-5 animate-bounce" />
          <h1 className="text-5xl font-black text-red-500 mb-2 tracking-widest">VIOLATION DETECTED</h1>
          <h2 className="text-3xl text-white font-bold mb-6">STRIKE {strikes} OF 3</h2>
          <p className="text-xl text-red-200 mb-10 max-w-2xl text-center">
            You navigated away from the exam or exited fullscreen. This is strictly prohibited. If you reach 3 strikes, your interview will be instantly terminated and marked as invalid.
          </p>
          <Button 
            onClick={() => setShowViolation(false)} 
            className="bg-white text-red-900 border-2 border-red-500 hover:bg-red-100 font-bold py-8 px-16 text-xl rounded-2xl"
          >
            I Acknowledge, Return to Exam
          </Button>
        </div>
      )}

      {/* NORMAL INTERVIEW UI */}
      <div className={`grid grid-cols-1 md:grid-cols-2 my-10 ${showViolation ? 'blur-md pointer-events-none' : ''}`}>
        <QuestionSection
          mockInterviewQuestion={mockInterviewQuestion}
          activeQuestionIndex={activeQuestionIndex}
        />

        <RecordAnswerSection
          mockInterviewQuestion={mockInterviewQuestion}
          activeQuestionIndex={activeQuestionIndex}
          interviewData={interviewData}
        />
      </div>

      <div className={`flex gap-3 my-5 md:justify-end md:gap-6 ${showViolation ? 'blur-md pointer-events-none' : ''}`}>
        {activeQuestionIndex > 0 && (
          <Button onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}>
            Previous Question
          </Button>
        )}

        {activeQuestionIndex != mockInterviewQuestion?.length - 1 && (
          <Button onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}>
            Next Question
          </Button>
        )}

        {activeQuestionIndex == mockInterviewQuestion?.length - 1 && (
          <Button onClick={() => {
            isEndingRef.current = true;
            if (document.fullscreenElement) document.exitFullscreen().catch(e=>console.log(e));
            router.push(`/dashboard/interview/${interviewData?.mockId}/feedback`);
          }}>
            End Interview
          </Button>
        )}
      </div>

    </div>
  );
};

export default StartInterviewClient;