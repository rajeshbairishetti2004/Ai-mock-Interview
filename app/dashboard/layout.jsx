import { UserButton } from "@clerk/nextjs";
import { Sparkles, Play } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen w-full bg-[#050505] text-white selection:bg-purple-500/30 overflow-hidden font-sans relative">

      {/* Dynamic Background Gradients matching Landing Page */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[150px]" />
      </div>

      {/* Glassmorphic NAVBAR */}
      <nav className="fixed w-full z-50 top-0 transition-all duration-300 backdrop-blur-md bg-black/40 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              InterviewAI
            </span>
          </Link>

          {/* Navigation */}
          <div className="flex gap-8 items-center text-sm font-medium text-gray-300">
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </Link>

            <Link href="/dashboard/howit" className="flex items-center gap-1 hover:text-white transition-colors">
               <Play className="w-4 h-4" /> How it Works
            </Link>

            {/* USER PROFILE */}
            <div className="ml-2 border-l border-white/10 pl-4 flex items-center">
              <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "w-8 h-8 rounded-full border border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.4)]" } }} />
            </div>

          </div>
        </div>
      </nav>

      {/* PAGE CONTENT */}
      <div className="relative z-10 pt-24 px-6 md:px-16 pb-12 w-full max-w-7xl mx-auto">
        {children}
      </div>

    </div>
  );
}