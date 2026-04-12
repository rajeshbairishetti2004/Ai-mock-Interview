"use client";
import React, { useEffect, useState } from "react";
import Pusher from "pusher-js";
import { useUser } from "@clerk/nextjs";
import { LoaderCircle, UserPlus, Swords, Play } from "lucide-react";
import { useRouter } from "next/navigation";

const AVATARS = [
  { id: 'ninja', emoji: '🥷', name: 'Ninja' },
  { id: 'cyborg', emoji: '🤖', name: 'Cyborg' },
  { id: 'wizard', emoji: '🧙‍♂️', name: 'Wizard' },
  { id: 'zombie', emoji: '🧟', name: 'Zombie' }
];

export default function DuelLobby({ params }) {
  const { user } = useUser();
  const router = useRouter();
  const [opponentJoined, setOpponentJoined] = useState(false);
  const [myAvatar, setMyAvatar] = useState(AVATARS[0]);
  const [opponentInfo, setOpponentInfo] = useState(null);
  
  const duelId = params.duelId;

  // Initialize Pusher connection
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });

    const channel = pusher.subscribe(duelId);
    
    // Listen for opponent
    channel.bind("player-joined", function (data) {
      // Do not treat our own broadcast as an opponent joining
      if (data.email === user?.primaryEmailAddress?.emailAddress) return;
      
      console.log("Broadcast received! Player joined:", data);
      setOpponentJoined(true);
      setOpponentInfo(data.avatar);
    });

    // Listen for match start signal
    channel.bind("match-started", function () {
      console.log("Match started! Teleporting to Arena...");
      // Save avatar to session storage to persist across navigation
      sessionStorage.setItem("arena_avatar", JSON.stringify(myAvatar));
      router.push(`/duel/${duelId}/arena`);
    });

    return () => {
      pusher.unsubscribe(duelId);
    };
  }, [duelId, router, myAvatar]);

  // LIVE GAMING: Broadcast my presence to the opponent whenever I load or change my avatar
  useEffect(() => {
     if (!user) return;
     const broadcastPresence = async () => {
        await fetch('/api/multiplayer/trigger', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId: duelId,
            event: 'player-joined',
            data: { 
              email: user?.primaryEmailAddress?.emailAddress,
              avatar: myAvatar 
            }
          })
        });
     };
     // Add a tiny delay to ensure Pusher is connected before sending
     const timeoutId = setTimeout(broadcastPresence, 1000);
     return () => clearTimeout(timeoutId);
  }, [myAvatar, user, duelId]);

  const testTrigger = async () => {
     await fetch('/api/multiplayer/trigger', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         roomId: duelId,
         event: 'player-joined',
         data: { 
           email: user?.primaryEmailAddress?.emailAddress,
           avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)] // random opponent for demo
         }
       })
     });
  };

  const startMatch = async () => {
     await fetch('/api/multiplayer/trigger', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         roomId: duelId,
         event: 'match-started',
         data: {}
       })
     });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center p-8 bg-black text-white selection:bg-purple-500">
       <Swords className="w-24 h-24 text-purple-500 mb-6 animate-pulse drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]"/>
       <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text mb-2">
         Arena Lobby
       </h1>
       <p className="text-gray-400 mb-8 max-w-lg">
         Select your Fighter. Once both players construct their loadout, the arena will lock.
       </p>
       
       {/* 👤 AVATAR SELECTION */}
       <div className="flex gap-4 mb-8">
         {AVATARS.map((av) => (
            <button 
               key={av.id}
               onClick={() => setMyAvatar(av)}
               className={`text-6xl p-4 rounded-2xl transition-all border-4 bg-gray-900/50 hover:bg-gray-800
               ${myAvatar.id === av.id ? 'border-purple-500 scale-110 shadow-[0_0_30px_rgba(168,85,247,0.6)]' : 'border-transparent opacity-50 grayscale hover:grayscale-0'}`}
            >
               {av.emoji}
            </button>
         ))}
       </div>

       <div className="w-full max-w-md p-6 bg-gray-900 border border-purple-700/50 rounded-2xl mb-10 shadow-[0_0_60px_rgba(168,85,247,0.15)]">
          <div className="flex justify-between items-center mb-5 pb-5 border-b border-gray-800">
             <div className="flex items-center gap-3">
                <span className="text-2xl">{myAvatar.emoji}</span>
                <span className="font-semibold">{myAvatar.name} ({user?.firstName})</span>
             </div>
             <span className="text-green-400 text-sm font-bold bg-green-400/10 px-3 py-1 rounded-full border border-green-500/30">LOCKED IN</span>
          </div>
          <div className="flex justify-between items-center text-gray-500">
             <div className="flex items-center gap-3">
                {opponentJoined && opponentInfo ? (
                   <span className="text-2xl">{opponentInfo.emoji}</span>
                ) : null}
                <span className={opponentJoined ? "text-white font-semibold" : ""}>
                  {opponentJoined ? `Opponent` : "Awaiting Challenger..."}
                </span>
             </div>
             {opponentJoined ? (
                <span className="text-red-400 text-sm font-bold bg-red-400/10 px-3 py-1 rounded-full border border-red-500/30">LOCKED IN</span>
             ) : (
                <LoaderCircle className="animate-spin w-5 h-5"/>
             )}
          </div>
       </div>

       <div className="flex flex-col sm:flex-row gap-4">
         
         {!opponentJoined && (
           <>
             <button 
               onClick={() => {
                 navigator.clipboard.writeText(window.location.href);
                 alert("Lobby Link Copied to Clipboard!");
               }}
               className="flex items-center justify-center px-6 py-4 bg-white/5 hover:bg-white/10 transition-all rounded-xl font-bold border border-white/10 text-gray-300 w-full sm:w-auto"
             >
               <UserPlus className="mr-3 w-5 h-5"/>
               Copy Invite Link
             </button>

             <button 
               onClick={testTrigger}
               className="px-8 py-4 bg-purple-900 hover:bg-purple-800 transition-all rounded-xl font-bold text-gray-200 shadow-md w-full sm:w-auto"
             >
               Simulate Opponent Join
             </button>
           </>
         )}

         {opponentJoined && (
           <button 
             onClick={startMatch}
             className="flex items-center justify-center px-10 py-5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 transition-all rounded-xl font-black text-white text-xl shadow-[0_0_40px_rgba(220,38,38,0.6)] w-full sm:w-auto animate-bounce"
           >
             <Play className="mr-3 w-7 h-7 fill-white" />
             START MATCH
           </button>
         )}

       </div>
    </div>
  );
}
