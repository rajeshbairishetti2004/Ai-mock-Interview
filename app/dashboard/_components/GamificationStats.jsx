"use client";
import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Flame, Star, Trophy, Target } from "lucide-react";
import { motion } from "framer-motion";

const GamificationStats = () => {
  const { user } = useUser();
  const [stats, setStats] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalPoints: 0,
    totalInterviews: 0
  });

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      GetStats();
    }
  }, [user]);

  const GetStats = async () => {
    try {
      const email = user.primaryEmailAddress.emailAddress;
      const res = await fetch(`/api/get-stats?email=${email}`);
      const result = await res.json();

      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Failed to load gamification stats:", error);
    }
  };

  const statCards = [
    {
      title: "Current Streak",
      value: `${stats.currentStreak} Days`,
      icon: <Flame className="w-8 h-8 text-orange-400" />,
      color: "from-orange-500/20 to-red-500/10",
      border: "border-orange-500/30",
      delay: 0.1
    },
    {
      title: "Total XP Points",
      value: stats.totalPoints,
      icon: <Star className="w-8 h-8 text-yellow-400" />,
      color: "from-yellow-500/20 to-orange-500/10",
      border: "border-yellow-500/30",
      delay: 0.2
    },
    {
      title: "Longest Streak",
      value: `${stats.longestStreak} Days`,
      icon: <Trophy className="w-8 h-8 text-purple-400" />,
      color: "from-purple-500/20 to-pink-500/10",
      border: "border-purple-500/30",
      delay: 0.3
    },
    {
      title: "Questions Answered",
      value: Math.floor(stats.totalPoints / 10), // Assuming 10 pts per question
      icon: <Target className="w-8 h-8 text-blue-400" />,
      color: "from-blue-500/20 to-cyan-500/10",
      border: "border-blue-500/30",
      delay: 0.4
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
      {statCards.map((stat, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: stat.delay }}
          className={`flex flex-col items-center justify-center p-6 rounded-2xl border ${stat.border} bg-gradient-to-br ${stat.color} backdrop-blur-md shadow-lg shadow-black/20`}
        >
          <div className="mb-3 p-3 bg-black/20 rounded-full">
            {stat.icon}
          </div>
          <h3 className="text-3xl font-black text-white">{stat.value}</h3>
          <p className="text-sm font-medium text-gray-400 mt-1 uppercase tracking-wider">{stat.title}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default GamificationStats;
