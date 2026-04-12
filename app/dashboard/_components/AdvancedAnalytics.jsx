"use client"
import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';
import { MessageSquareWarning, BarChart2, TrendingUp, LoaderCircle } from 'lucide-react';

const AdvancedAnalytics = () => {
  const { user } = useUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdvancedStats = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) return;
      try {
        const res = await fetch(`/api/get-advanced-stats?email=${user.primaryEmailAddress.emailAddress}`);
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error("Failed to load advanced stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdvancedStats();
  }, [user?.primaryEmailAddress?.emailAddress]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-48 bg-white/5 rounded-2xl border border-white/10 mt-8 mb-10 w-full animate-pulse">
         <LoaderCircle className="animate-spin text-cyan-400 w-8 h-8 mb-2" />
         <span className="text-gray-400">Loading Deep Analytics...</span>
      </div>
    );
  }

  // Handle case where user hasn't done any interviews yet
  if (!data || data.totalAnswers === 0) {
    return (
      <div className="p-8 bg-white/5 rounded-2xl border border-white/10 text-center mt-8 mb-10 text-gray-400 shadow-lg">
        <BarChart2 className="w-12 h-12 mx-auto mb-3 text-purple-400/50" />
        <p>Complete a mock interview to unlock your deep analytics dashboard.</p>
      </div>
    );
  }

  return (
    <div className="mb-16">
      <h2 className="text-3xl font-semibold text-cyan-300 mb-6 flex items-center">
        <TrendingUp className="mr-3 text-cyan-400" /> Deep Analytics
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Radar Chart (Left Column) */}
        <div className="col-span-1 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-center items-center transition-all hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]">
          <h3 className="text-xl text-gray-200 font-semibold mb-2">Skill Matrix</h3>
          <p className="text-xs text-gray-400 mb-4 text-center">Your performance vectors.</p>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.radarChartData}>
                <PolarGrid stroke="#4c1d95" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#e2e8f0', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Score" dataKey="A" stroke="#22d3ee" fill="#8b5cf6" fillOpacity={0.6} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#3b0764', borderRadius: '10px' }}
                  itemStyle={{ color: '#22d3ee' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart (Middle/Right) */}
        <div className="col-span-1 lg:col-span-2 bg-gradient-to-br from-[#1e0a2d]/80 to-[#1e3a8a]/40 border border-purple-500/30 rounded-2xl p-6 shadow-xl flex flex-col backdrop-blur-md transition-all hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]">
          <h3 className="text-xl text-gray-200 font-semibold mb-2">Scores by Role Category</h3>
          <p className="text-xs text-gray-400 mb-4">Compare your technical vs communication performance across topics.</p>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.categoryChartData}
                margin={{ top: 5, right: 30, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" opacity={0.3} vertical={false} />
                <XAxis dataKey="name" tick={{fill: '#cbd5e1', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 10]} tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#3b0764', borderRadius: '10px', color: '#fff' }}
                  cursor={{fill: 'rgba(255, 255, 255, 0.05)'}}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                <Bar dataKey="Technical" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Communication" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Mini Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        
        <div className="bg-white/5 border border-red-500/30 rounded-xl p-5 flex items-center shadow-lg relative overflow-hidden group hover:border-red-500/60 transition-all">
          <div className="absolute right-0 top-0 opacity-10 group-hover:opacity-20 transition duration-300">
            <MessageSquareWarning size={100} className="text-red-400 -mr-4 -mt-4" />
          </div>
          <div className="bg-red-500/20 p-4 rounded-lg flex-shrink-0 mr-4 border border-red-500/50">
            <MessageSquareWarning className="text-red-400 w-8 h-8" />
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Filler Words Detected</p>
            <h4 className="text-2xl font-bold text-red-200">{data.totalFillerWords} <span className="text-sm font-normal text-red-400/70">total "ums" & "uhs"</span></h4>
          </div>
        </div>

        <div className="bg-white/5 border border-cyan-500/30 rounded-xl p-5 flex items-center shadow-lg relative overflow-hidden group hover:border-cyan-500/60 transition-all">
          <div className="absolute right-0 top-0 opacity-10 group-hover:opacity-20 transition duration-300">
             <BarChart2 size={100} className="text-cyan-400 -mr-4 -mt-4" />
          </div>
          <div className="bg-cyan-500/20 p-4 rounded-lg flex-shrink-0 mr-4 border border-cyan-500/50">
             <span className="text-cyan-400 font-bold text-2xl">{(data.averageTechScore).toFixed(1)}</span>
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Avg Technical Score</p>
            <p className="text-xs text-cyan-200/60 mt-1">Based on {data.totalAnswers} answers</p>
          </div>
        </div>

        <div className="bg-white/5 border border-purple-500/30 rounded-xl p-5 flex items-center shadow-lg relative overflow-hidden group hover:border-purple-500/60 transition-all">
          <div className="absolute right-0 top-0 opacity-10 group-hover:opacity-20 transition duration-300">
             <BarChart2 size={100} className="text-purple-400 -mr-4 -mt-4" />
          </div>
          <div className="bg-purple-500/20 p-4 rounded-lg flex-shrink-0 mr-4 border border-purple-500/50">
             <span className="text-purple-400 font-bold text-2xl">{(data.averageCommScore).toFixed(1)}</span>
          </div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Avg Comm. Score</p>
            <p className="text-xs text-purple-200/60 mt-1">Based on transcript clarity</p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdvancedAnalytics;
