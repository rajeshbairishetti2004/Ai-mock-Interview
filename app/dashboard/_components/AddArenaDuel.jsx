"use client";

import React from "react";
import { Swords } from "lucide-react";
import { useRouter } from "next/navigation";

function AddArenaDuel() {
  const router = useRouter();

  return (
    <div 
      onClick={() => router.push('/duel/test-match-1')}
      className="p-10 border border-yellow-500/50 bg-gradient-to-br from-yellow-900/80 via-red-900/80 to-black rounded-3xl cursor-pointer hover:scale-105 hover:shadow-[0_0_80px_rgba(234,179,8,0.5)] transition-all flex flex-col justify-center items-center backdrop-blur-xl shadow-[0_0_40px_rgba(234,179,8,0.2)]"
    >
      <div className="bg-yellow-400 p-4 rounded-full mb-4 shadow-[0_0_20px_rgba(234,179,8,0.8)]">
        <Swords className="h-10 w-10 text-red-900 animate-pulse" />
      </div>
      <h2 className="font-black text-2xl text-yellow-400 tracking-wide mt-2 text-center drop-shadow-md">
        ARENA DUEL
      </h2>
      <p className="text-yellow-200/80 text-sm mt-3 text-center font-bold">
        Enter the Live Multiplayer Lobby
      </p>
    </div>
  );
}

export default AddArenaDuel;
