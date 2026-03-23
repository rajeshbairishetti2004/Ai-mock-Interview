 import { UserButton } from "@clerk/nextjs";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-r from-[#06122b] via-[#0f2b57] to-[#5b21b6] text-white">

      {/* NAVBAR */}
      <div className="w-full flex justify-between items-center px-16 py-4 border-b border-white/10">

        {/* Logo */}
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          AI Mock Interview
        </h1>

        {/* Navigation */}
        <div className="flex gap-8 items-center text-gray-300">

          <a href="/dashboard" className="hover:text-cyan-400 transition">
            Dashboard
          </a>

          <a href="/dashboard/question" className="hover:text-cyan-400 transition">
            Questions
          </a>

          <a href="/dashboard/upgrade" className="hover:text-cyan-400 transition">
            Upgrade
          </a>

          <a href="/dashboard/howit" className="hover:text-cyan-400 transition">
            How it works
          </a>

          {/* USER PROFILE */}
          <div className="ml-6">
            <UserButton afterSignOutUrl="/" />
          </div>

        </div>

      </div>

      {/* PAGE CONTENT */}
      <div className="px-16 py-10">
        {children}
      </div>

    </div>
  );
}