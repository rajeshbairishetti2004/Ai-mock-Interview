"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Trophy, BrainCircuit, Code2, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function HowItWorks() {
  const steps = [
    {
      icon: <BrainCircuit className="w-6 h-6 text-purple-400" />,
      title: "1. Create an AI Mock Interview",
      desc: "Click 'Add New Interview' on your dashboard. You can upload a Resume (PDF/DOCX) to generate hyper-personalized questions based on your actual experience, or select 'General Questions' for a standard interview format."
    },
    {
      icon: <Users className="w-6 h-6 text-pink-400" />,
      title: "2. Choose your Interviewer Persona",
      desc: "Are you bracing for a tough technical round or a casual HR chat? Select from Personas like 'Strict Technical Lead' or 'Friendly HR' to dynamically change the AI's strictness and focus!"
    },
    {
      icon: <Code2 className="w-6 h-6 text-emerald-400" />,
      title: "3. Voice or Live Code Editor",
      desc: "During the interview, use the Voice recording to practice your spoken answers. For software roles, toggle 'Use Code Editor' to crack algorithms right in the browser using JavaScript, Python, Java, or C++!"
    },
    {
      icon: <Sparkles className="w-6 h-6 text-blue-400" />,
      title: "4. Get S.T.A.R. Method Feedback",
      desc: "Once finished, review your answers. For behavioral questions, our AI specifically grades you using the S.T.A.R. framework (Situation, Task, Action, Result) and tells you exactly what you missed."
    },
    {
      icon: <Trophy className="w-6 h-6 text-yellow-500" />,
      title: "5. Earn Streaks & XP Points!",
      desc: "Practice makes perfect. Every question you answer earns you 10 XP Points. Practice daily to build your 'Current Streak' flame! Break a day, and you lose your streak. Keep climbing!"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-10 w-full text-white">
      
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-500">
          How InterviewAI Works
        </h1>
        <p className="text-xl text-gray-400 mb-12 border-b border-white/10 pb-8">
          Your ultimate guide to mastering interviews, earning XP, and landing your dream job.
        </p>
      </motion.div>

      <div className="space-y-6">
        {steps.map((step, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="p-6 md:p-8 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-500/30 transition-colors flex flex-col md:flex-row gap-6 items-start shadow-xl"
          >
            <div className="p-4 rounded-xl bg-white/[0.05] border border-white/5 shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.02)]">
              {step.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-3 text-gray-100">{step.title}</h2>
              <p className="text-gray-400 leading-relaxed font-light text-lg">
                {step.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
