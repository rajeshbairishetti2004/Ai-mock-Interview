"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Bot, 
  BrainCircuit, 
  Code2, 
  LineChart, 
  Sparkles, 
  Trophy, 
  Users, 
  ChevronRight,
  Play
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: <Bot className="w-8 h-8 text-blue-400" />,
      title: "Hyper-Realistic AI",
      desc: "Practice with an AI that mimics actual human interviewers, complete with dynamic follow-up questions."
    },
    {
      icon: <BrainCircuit className="w-8 h-8 text-purple-400" />,
      title: "Smart STAR Grading",
      desc: "Get instant behavioral feedback mapped directly to the S.T.A.R. methodology."
    },
    {
      icon: <Code2 className="w-8 h-8 text-emerald-400" />,
      title: "Live Code Editor",
      desc: "Integrated multi-language IDE. Crack technical rounds right inside the browser."
    },
    {
      icon: <LineChart className="w-8 h-8 text-orange-400" />,
      title: "Actionable Insights",
      desc: "Deep-dive analytics on your performance, tone, and filler word usage."
    },
    {
      icon: <Trophy className="w-8 h-8 text-yellow-400" />,
      title: "Gamified Streaks",
      desc: "Build consistency. Maintain streaks, earn points, and climb the global leaderboards."
    },
    {
      icon: <Users className="w-8 h-8 text-pink-400" />,
      title: "Shareable Reports",
      desc: "Generate public links of your AI feedback to share with mentors for human review."
    }
  ];

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 overflow-hidden font-sans">
      
      {/* Dynamic Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[150px]" />
      </div>

      {/* Glassmorphic Navbar */}
      <nav className="fixed w-full z-50 top-0 transition-all duration-300 backdrop-blur-md bg-black/40 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              InterviewAI
            </span>
          </div>
          <div className="hidden md:flex gap-8 items-center text-sm font-medium text-gray-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <Link href="/sign-in" className="hover:text-white transition-colors">
              Login
            </Link>
            <Link href="/sign-up">
              <button className="bg-white text-black px-5 py-2 rounded-full hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                Start Practicing
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 z-10 flex flex-col items-center justify-center min-h-[90vh]">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm md:text-md text-purple-300 mb-8 mt-10">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
            </span>
            Now supporting Live Code Editors & Streaks
          </div>
          
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight mb-8 leading-tight">
            Nail your next <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
              Tech Interview.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto font-light">
            An advanced AI-driven mock interview platform. Practice behavioral, technical, and system design questions in a hyper-realistic environment.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/sign-up">
              <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                Start Your First Mock
                <ChevronRight className="w-5 h-5" />
              </button>
            </Link>
            <a href="#how-it-works">
              <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-4 rounded-full font-semibold text-lg transition-colors">
                <Play className="w-5 h-5" fill="currentColor" />
                See how it works
              </button>
            </a>
          </div>
        </motion.div>

        {/* Floating UI Elements Simulation */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="mt-20 relative w-full max-w-5xl mx-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10" />
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm overflow-hidden shadow-2xl">
            <div className="flex gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="grid grid-cols-3 gap-4 opacity-50">
              <div className="col-span-1 h-32 rounded-lg bg-white/5" />
              <div className="col-span-2 h-32 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-white/5" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 relative z-10 bg-black/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Level up your preparation</h2>
            <p className="text-gray-400 text-lg">Everything you need to conquer your career defining moments.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -5, scale: 1.02 }}
                className="p-8 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:border-purple-500/30 transition-colors group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent blur-2xl group-hover:from-purple-500/20 transition-all rounded-full" />
                <div className="mb-6 inline-block p-4 rounded-xl bg-white/[0.05]">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative z-10">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="p-12 md:p-20 rounded-3xl bg-gradient-to-b from-purple-900/20 to-blue-900/10 border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 relative z-10">
              Ready to land your dream job?
            </h2>
            <p className="text-xl text-gray-300 mb-10 relative z-10 max-w-2xl mx-auto">
              Join thousands of candidates who cracked top-tier companies using our AI simulation platform.
            </p>
            <Link href="/sign-up" className="relative z-10">
              <button className="bg-white text-black px-10 py-4 rounded-full font-bold text-lg hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all">
                Create Free Account
              </button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-12 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} InterviewAI Platform. All rights reserved.</p>
      </footer>
    </main>
  );
}