import React from "react";
import AddNewInterview from "./_components/AddNewInterview";
import InterviewList from "./_components/InterviewList";
import GamificationStats from "./_components/GamificationStats";
const Dashboard = () => {
  return (
    <div className="w-full text-white">

      {/* HEADER */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          AI Interview Dashboard
        </h1>

        <p className="text-gray-300 mt-3 text-lg">
          Create and start your AI Mock Interview
        </p>
      </div>

      {/* GAMIFICATION STATS */}
      <GamificationStats />

      {/* CREATE INTERVIEW SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">

        <div className="
        rounded-3xl
        border border-purple-500/40
        bg-gradient-to-br from-[#3b0764]/70 via-[#4c1d95]/70 to-[#1e3a8a]/70
        backdrop-blur-xl
        p-8
        shadow-[0_0_60px_rgba(168,85,247,0.4)]
        hover:scale-105
        hover:shadow-[0_0_80px_rgba(168,85,247,0.6)]
        transition-all
        duration-300
        ">

          <AddNewInterview/>

        </div>

      </div>


      {/* PREVIOUS INTERVIEWS */}
      <div>

        <h2 className="text-3xl font-semibold text-cyan-300 mb-6">
          Previous Mock Interviews
        </h2>

        <div className="
        rounded-2xl
        border border-white/10
        bg-white/10
        backdrop-blur-lg
        p-8
        shadow-[0_0_40px_rgba(0,0,0,0.4)]
        ">

          <InterviewList/>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;