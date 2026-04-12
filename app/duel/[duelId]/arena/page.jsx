"use client";
import React, { useEffect, useState, useRef } from "react";
import Pusher from "pusher-js";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Zap, Mic, Lock, User, Clock, CheckCircle, XCircle, Trophy } from "lucide-react";
import { toast } from "sonner";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

// Final eSports Demo Questions
const ARENA_QUESTIONS = [
  "Explain the concept of closures in JavaScript and provide a common use case.",
  "Describe the difference between SQL and NoSQL databases. When would you use each?",
  "Tell me about a time you had to deal with a conflict within your team.",
  "How does React's Virtual DOM work under the hood?",
  "What is the time complexity of binary search, and why?"
];

// Synth Audio Engine for eSports Sound Effects
const playSound = (type) => {
   const AudioContext = window.AudioContext || window.webkitAudioContext;
   if (!AudioContext) return;
   const ctx = new AudioContext();
   const osc = ctx.createOscillator();
   const gain = ctx.createGain();
   osc.connect(gain);
   gain.connect(ctx.destination);
   
   if (type === 'buzz') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
   } else if (type === 'win') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
   } else if (type === 'fail') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(50, ctx.currentTime + 0.6);
      gain.gain.setValueAtTime(1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
   } else if (type === 'tick') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
   }
};

export default function Arena({ params }) {
  const { user } = useUser();
  const router = useRouter();
  const duelId = params.duelId;
  const { width, height } = useWindowSize();

  // ==== GAME STATE ====
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [buzzedInUser, setBuzzedInUser] = useState(null);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [hostHealth, setHostHealth] = useState(100);
  const [guestHealth, setGuestHealth] = useState(100);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  // Avatar Recovery
  const [myAvatar, setMyAvatar] = useState(null);
  
  useEffect(() => {
     const stored = sessionStorage.getItem("arena_avatar");
     if (stored) setMyAvatar(JSON.parse(stored));
  }, []);

  // ==== SPEECH RECOGNITION ====
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  // Initialize Pusher connection
  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });

    const channel = pusher.subscribe(duelId);
    
    // 1. Listen for Buzzer Hits
    channel.bind("buzzer-pressed", function (data) {
      playSound('buzz');
      setBuzzedInUser(data);
      
      if (data.email !== user?.primaryEmailAddress?.emailAddress) {
        setIsLockedOut(true);
      }
      
      setIsActive(true); 
      setTimeLeft(60);
      setLastResult(null);
    });

    // 2. Listen for Auto-Advance
    channel.bind("round-resolved", function (data) {
       if (data.success) {
          setLastResult("SUCCESS");
          playSound('win');
          toast(`🔥 ${data.answeringPlayer} ACED IT!`);
       } else {
          setLastResult("FAIL");
          playSound('fail');
          toast(`❌ ${data.answeringPlayer} CHOKED!`);
          
          // Apply Damage
          if (data.isHost) setHostHealth(h => Math.max(0, h - 25));
          else setGuestHealth(h => Math.max(0, h - 25));
       }

       // PREVENT INFINITE LOOP: Instantly shut off the timer hooks before 3sec delay
       setIsEvaluating(false);
       setIsActive(false); 

       if (data.nextIndex >= ARENA_QUESTIONS.length || hostHealth <= 0 || guestHealth <= 0) {
          setTimeout(() => setGameOver(true), 1500);
       } else {
          setTimeout(() => {
             // Reset for next round
             setBuzzedInUser(null);
             setIsLockedOut(false);
             setIsActive(false);
             setIsEvaluating(false);
             setTimeLeft(60);
             setActiveQuestionIndex(data.nextIndex);
             setLastResult(null);
          }, 3000);
       }
    });

    return () => {
      pusher.unsubscribe(duelId);
    };
  }, [duelId, user, hostHealth, guestHealth]);

  // ==== TIMER LOGIC ====
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0 && !isEvaluating) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
        if (timeLeft <= 5) playSound('tick');
      }, 1000);
    } else if (timeLeft === 0 && isActive && !isEvaluating) {
      handleTimeOut(); 
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, isEvaluating]);

  // ==== BUZZER LOGIC ====
  const hitBuzzer = async () => {
      if (isLockedOut || buzzedInUser || gameOver) return;
      
      playSound('buzz');
      
      const me = {
         email: user?.primaryEmailAddress?.emailAddress,
         name: user?.firstName || "Player",
         avatar: myAvatar,
         isHost: true 
      };
      
      startVoiceRecording();

      setBuzzedInUser(me);
      setIsActive(true);
      setTimeLeft(15);

      await fetch('/api/multiplayer/trigger', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ roomId: duelId, event: 'buzzer-pressed', data: me })
      });
  };

  // ==== MICROPHONE CONTROL ====
  const startVoiceRecording = () => {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) return;
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let finalTrans = "";
        for (let i = 0; i < event.results.length; i++) {
          finalTrans += event.results[i][0].transcript;
        }
        setTranscript(finalTrans);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.log(e);
    }
  };

  // ==== TIMEOUT / SUBMIT LOGIC ====
  const handleTimeOut = async () => {
      if (buzzedInUser?.email !== user?.primaryEmailAddress?.emailAddress) return;
      if (recognitionRef.current) recognitionRef.current.stop();

      setIsEvaluating(true);
      
      try {
         let success = false;
         if (transcript.trim().length > 5) {
             const response = await fetch("/api/ai-feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  question: ARENA_QUESTIONS[activeQuestionIndex],
                  userAnswer: transcript,
                  resumeText: "No resume for arena demo",
                }),
             });
             
             const result = await response.json();
             // Require a rating of 6 out of 10 or higher for a strict pass
             if (result.success && result.data.rating >= 6) {
                 success = true;
             }
         }

         const nextIndex = activeQuestionIndex + 1;
         
         await fetch('/api/multiplayer/trigger', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
                roomId: duelId,
                event: 'round-resolved',
                data: {
                   success,
                   answeringPlayer: user?.firstName || "Player",
                   isHost: buzzedInUser.isHost,
                   nextIndex
                }
             })
          });

          setTranscript("");
      } catch (err) {
         console.error(err);
         setIsEvaluating(false);
      }
  };

  // ==== RENDER GAME OVER ====
  if (gameOver) {
     const isWinner = hostHealth > guestHealth; // Simplified for host view demo
     return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white relative">
           <Confetti width={width} height={height} recycle={true} numberOfPieces={500} colors={['#A855F7', '#EF4444', '#EAB308']}/>
           <div className="z-10 bg-gray-900 border-2 border-purple-500 p-16 rounded-3xl text-center shadow-[0_0_100px_rgba(168,85,247,0.5)]">
              <Trophy className="w-32 h-32 text-yellow-500 mx-auto mb-6 animate-pulse" />
              <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                 {isWinner ? "YOU ARE THE CHAMPION!" : "YOU HAVE BEEN DEFEATED!"}
              </h1>
              <p className="text-xl text-gray-400 mb-10">Match over. Final Health: {hostHealth} HP</p>
              <button 
                 onClick={() => router.push('/dashboard')}
                 className="px-10 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-full text-xl transition-all hover:scale-105"
              >
                 Return to Dashboard
              </button>
           </div>
        </div>
     );
  }

  // ==== RENDER ARENA ====
  return (
    <div className="flex flex-col items-center min-h-screen bg-[#050505] text-white p-6 font-sans selection:bg-yellow-500 selection:text-black overflow-hidden relative">
      
      {lastResult === 'SUCCESS' && <Confetti width={width} height={height} recycle={false} numberOfPieces={300} />}

      {/* 1. FIGHTING GAME HEALTH BARS */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-8 bg-gray-900/80 backdrop-blur-xl border border-gray-800 p-4 rounded-3xl shadow-2xl mt-2">
         
         {/* HOST HEALTH */}
         <div className="flex w-[40%] gap-4 items-center">
            <div className="text-4xl bg-gray-800 p-3 rounded-lg border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
               {myAvatar ? myAvatar.emoji : '👤'}
            </div>
            <div className="flex-1">
               <div className="flex justify-between mb-1">
                  <span className="font-bold tracking-widest text-blue-400">HOST ({user?.firstName})</span>
                  <span className="font-black font-mono">{hostHealth}%</span>
               </div>
               <div className="w-full h-6 bg-gray-800 rounded-full border border-gray-700 overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${hostHealth > 50 ? 'bg-green-500' : hostHealth > 20 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${hostHealth}%` }}></div>
               </div>
            </div>
         </div>

         {/* Center Clock */}
         <div className="flex flex-col items-center justify-center bg-black px-8 py-3 rounded-2xl border border-gray-700 shadow-[0_0_30px_rgba(0,0,0,0.8)] z-10 mx-4">
           <Clock className="w-4 h-4 text-gray-500 mb-1" />
           <span className={`text-3xl font-black font-mono ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
             {timeLeft}s
           </span>
         </div>

         {/* GUEST HEALTH */}
         <div className="flex w-[40%] gap-4 items-center flex-row-reverse">
            <div className="text-4xl bg-gray-800 p-3 rounded-lg border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
               👽
            </div>
            <div className="flex-1">
               <div className="flex justify-between flex-row-reverse mb-1">
                  <span className="font-bold tracking-widest text-red-500">OPPONENT</span>
                  <span className="font-black font-mono">{guestHealth}%</span>
               </div>
               <div className="w-full h-6 bg-gray-800 rounded-full border border-gray-700 overflow-hidden flex justify-end">
                  <div className={`h-full transition-all duration-500 ${guestHealth > 50 ? 'bg-green-500' : guestHealth > 20 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${guestHealth}%` }}></div>
               </div>
            </div>
         </div>

      </div>

      {/* 2. CENTER STAGE (The Question) */}
      <div className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center text-center px-4">
         <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black px-6 py-2 rounded-full mb-8 border border-purple-400/50 flex items-center gap-2 transform -skew-x-12 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
           <Zap className="w-5 h-5 fill-white" /> ROUND {activeQuestionIndex + 1}
         </span>
         
         <div className={`bg-gray-900/60 backdrop-blur p-12 rounded-3xl border shadow-2xl transition-all duration-300 w-full
            ${lastResult === 'SUCCESS' ? 'border-green-500 shadow-[0_0_80px_rgba(34,197,94,0.3)]' : 
              lastResult === 'FAIL' ? 'border-red-500 shadow-[0_0_80px_rgba(239,68,68,0.3)]' : 'border-gray-700'}`}>
             <h2 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight mb-8 text-gray-100 min-h-[120px] flex items-center justify-center">
               {ARENA_QUESTIONS[activeQuestionIndex]}
             </h2>
             
             {/* Dynamic State Banner */}
             <div className="h-20 flex justify-center items-center">
                 {isEvaluating ? (
                    <div className="px-10 py-5 rounded-xl font-black text-2xl flex items-center gap-4 bg-purple-600 border-4 border-purple-400 text-white shadow-[0_0_40px_rgba(147,51,234,0.8)] animate-pulse uppercase tracking-widest">
                       🤖 AI EVALUATING...
                    </div>
                 ) : lastResult ? (
                    <div className={`px-10 py-5 rounded-xl font-black text-3xl flex items-center gap-4 uppercase tracking-widest text-white border-4 animate-bounce
                       ${lastResult === 'SUCCESS' ? 'bg-green-600 border-green-300 shadow-[0_0_40px_rgba(34,197,94,0.8)]' : 'bg-red-600 border-red-300 shadow-[0_0_40px_rgba(239,68,68,0.8)]'}`}>
                       {lastResult === 'SUCCESS' ? <><CheckCircle size={36}/> PERFECT STRIKE</> : <><XCircle size={36}/> DAMAGE DEALT</>}
                    </div>
                 ) : buzzedInUser ? (
                    <div className={`px-10 py-5 rounded-xl font-black text-2xl flex items-center gap-4 animate-pulse shadow-2xl border-4 uppercase tracking-widest
                       ${buzzedInUser.email === user?.primaryEmailAddress?.emailAddress ? 'bg-blue-600 border-blue-400 text-white shadow-blue-500/50' : 'bg-orange-600 border-orange-400 text-white shadow-orange-500/50'}`}>
                       <Mic size={32} /> 
                       {buzzedInUser.name} ATTACKING!
                    </div>
                 ) : (
                    <span className="text-gray-500 font-black tracking-[0.3em] text-xl">
                       AWAITING INITIATION
                    </span>
                 )}
             </div>

             {/* Live Transcript Display */}
             {buzzedInUser?.email === user?.primaryEmailAddress?.emailAddress && transcript && (
                <div className="mt-8 text-left bg-black/60 p-6 rounded-2xl border border-blue-500/50 max-h-32 overflow-y-auto w-full">
                   <p className="text-blue-200 font-mono text-lg">{transcript}</p>
                </div>
             )}
         </div>
      </div>

      {/* 3. THE GRAND BUZZER / STOP BUTTON */}
      <div className="w-full flex justify-center py-10 mt-auto mb-10 z-10">
        <button 
          onClick={buzzedInUser?.email === user?.primaryEmailAddress?.emailAddress ? handleTimeOut : hitBuzzer}
          disabled={isLockedOut || (buzzedInUser && buzzedInUser?.email !== user?.primaryEmailAddress?.emailAddress) || isEvaluating || lastResult}
          className={`
            relative group flex items-center justify-center overflow-hidden
            w-56 h-56 rounded-full border-[12px] shadow-2xl transition-all duration-100 font-black text-4xl transform
            ${isLockedOut || isEvaluating || lastResult || (buzzedInUser && buzzedInUser?.email !== user?.primaryEmailAddress?.emailAddress)
              ? 'bg-gray-800 border-gray-700 text-gray-600 cursor-not-allowed opacity-40 scale-95' 
              : buzzedInUser?.email === user?.primaryEmailAddress?.emailAddress 
                 ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_120px_rgba(59,130,246,0.8)] scale-110 hover:bg-blue-500 active:scale-95'
                 : 'bg-red-600 border-red-800 text-white hover:bg-red-500 active:bg-red-700 active:scale-90 active:border-red-900 shadow-[0_0_80px_rgba(220,38,38,0.5)] hover:shadow-[0_0_150px_rgba(220,38,38,0.9)]'}
          `}
        >
          {isLockedOut || (buzzedInUser && buzzedInUser?.email !== user?.primaryEmailAddress?.emailAddress) ? (
             <Lock className="w-20 h-20" />
          ) : isEvaluating || lastResult ? (
             <Zap className="w-20 h-20 text-gray-500" />
          ) : buzzedInUser?.email === user?.primaryEmailAddress?.emailAddress ? (
             <div className="flex flex-col items-center">
                 <Mic className="w-10 h-10 animate-bounce mb-1" />
                 <span className="text-xl tracking-wider">STOP</span>
             </div>
          ) : (
             <span className="tracking-tighter z-10">STRIKE</span>
          )}
          
          {!isLockedOut && !buzzedInUser && !isEvaluating && !lastResult && (
             <div className="absolute inset-0 bg-red-400 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity"></div>
          )}
        </button>
      </div>

    </div>
  );
}
