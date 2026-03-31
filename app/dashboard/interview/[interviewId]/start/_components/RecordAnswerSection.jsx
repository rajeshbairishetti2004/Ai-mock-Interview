"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useContext, useState, useRef } from "react";
import Webcam from "react-webcam";
import { Mic } from "lucide-react";
import { toast } from "sonner";
import { db } from "@/utils/db";
import { UserAnswer } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { WebCamContext } from "@/context/WebCamContext";
import moment from "moment";
import Editor from "@monaco-editor/react";
import * as faceapi from "@vladmandic/face-api";

const RecordAnswerSection = ({
  mockInterviewQuestion,
  activeQuestionIndex,
  interviewData,
}) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { webCamEnabled, setWebCamEnabled } = useContext(WebCamContext);

  const mediaRecorderRef = useRef(null);
  const recognitionRef = useRef(null);
  const webcamRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  const [warningMessage, setWarningMessage] = useState("");
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const [transcript, setTranscript] = useState("");
  const [recordingStartTime, setRecordingStartTime] = useState(null);

  // New states for Code Editor mode
  const [answerMode, setAnswerMode] = useState("webcam"); 
  const [codeValue, setCodeValue] = useState("// Write your solution here");
  const [codeLang, setCodeLang] = useState("javascript");

  // 🤖 LOAD AI PROCTORING MODELS
  React.useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        ]);
        setModelsLoaded(true);
      } catch (e) {
        console.error("Failed to load FaceAPI models:", e);
      }
    };
    loadModels();

    return () => {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    };
  }, []);

  // 👀 START ANTI-CHEAT TRACKING
  React.useEffect(() => {
    if (webCamEnabled && modelsLoaded && answerMode === "webcam") {
      startFaceDetection();
    } else {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
      setWarningMessage("");
    }
  }, [webCamEnabled, modelsLoaded, answerMode]);

  const startFaceDetection = () => {
    if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
    
    let violationCount = 0;
    
    detectionIntervalRef.current = setInterval(async () => {
      if (!webcamRef.current?.video || webcamRef.current.video.readyState !== 4) return;
      
      const detection = await faceapi.detectSingleFace(
        webcamRef.current.video, 
        new faceapi.TinyFaceDetectorOptions({ inputSize: 160, scoreThreshold: 0.5 })
      ).withFaceLandmarks();
      
      if (!detection) {
        violationCount++;
        if (violationCount > 3) setWarningMessage("⚠️ Warning: No face detected! Please look at the camera.");
      } else {
        const landmarks = detection.landmarks;
        const nose = landmarks.getNose();
        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();

        if (nose.length > 0 && leftEye.length > 0 && rightEye.length > 0) {
          const noseX = nose[0].x;
          const leftEyeX = leftEye[0].x;
          const rightEyeX = rightEye[3].x;

          const distLeft = noseX - leftEyeX;
          const distRight = rightEyeX - noseX;
          const ratio = distLeft / (distRight || 1);

          if (ratio < 0.45 || ratio > 2.0) {
            violationCount++;
            if (violationCount > 3) setWarningMessage("⚠️ Warning: Looking away detected! Please face the screen.");
          } else {
            violationCount = 0;
            setWarningMessage("");
          }
        }
      }
    }, 1000);
  };

  // 🎤 START RECORDING (Speech-to-Text)
  const startRecording = async () => {
    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        toast("❌ Speech recognition not supported in this browser");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let finalTranscript = "";

        for (let i = 0; i < event.results.length; i++) {
          finalTranscript += event.results[i][0].transcript;
        }

        setTranscript(finalTranscript);
      };

      recognition.start();
      recognitionRef.current = recognition;

      setTranscript("");
      setRecordingStartTime(Date.now());
      setIsRecording(true);

    } catch (error) {
      console.error(error);
      toast("❌ Microphone error");
    }
  };

  // 🛑 STOP RECORDING + AI + SAVE
  const stopRecording = async () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);

      try {
        setLoading(true);

        const recordingDuration =
          (Date.now() - recordingStartTime) / 1000;

        const question =
          mockInterviewQuestion?.[activeQuestionIndex]?.question;

        const answerText = answerMode === "code" ? codeValue : transcript;

        console.log("🗣️ ANSWER TEXT:", answerText);

        // ❌ VALIDATION (no speech)
        if (!answerText || answerText.trim().length < 5) {
          toast("⚠️ No valid speech detected");
          return;
        }

        if (!question) {
          throw new Error("Question is missing");
        }

        // 🔥 CALL AI API
        const response = await fetch("/api/ai-feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question,
            userAnswer: answerText,
            resumeText: interviewData?.resumeText,
          }),
        });

        if (!response.ok) {
          throw new Error("API request failed");
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "AI failed");
        }

        const aiData = result.data;

        // ✅ SAVE TO DB
        await db.insert(UserAnswer).values({
          mockIdRef: interviewData?.mockId,
          question,
          userAns: answerText,
          correctAns: aiData.correctAnswer,
          feedback: aiData.feedback,
          rating: aiData.rating.toString(),
          userEmail: user?.primaryEmailAddress?.emailAddress,
          createdAt: moment().format("YYYY-MM-DD"),
        });

        // 🏆 LOG GAMIFICATION
        await fetch("/api/log-activity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user?.primaryEmailAddress?.emailAddress }),
        }).catch((err) => console.log("Gamification Log Failed:", err));

        toast("✅ Answer saved with AI feedback");

      } catch (error) {
        console.error("❌ ERROR:", error);
        toast("❌ " + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">

      {/* TABS */}
      <div className="flex gap-4 mb-4 mt-6">
        <Button 
          variant={answerMode === "webcam" ? "default" : "outline"} 
          onClick={() => setAnswerMode("webcam")}
        >
          Use WebCam
        </Button>
        <Button 
          variant={answerMode === "code" ? "default" : "outline"} 
          onClick={() => setAnswerMode("code")}
        >
          Use Code Editor
        </Button>
      </div>

      {answerMode === "webcam" ? (
        <div className="flex flex-col items-center rounded-lg p-5 bg-[#050505] border border-white/10 mt-4 w-full md:w-[35rem] shadow-xl relative max-w-full">
          {webCamEnabled ? (
            <div className="relative w-full overflow-hidden rounded-lg group">
              <Webcam ref={webcamRef} mirrored style={{ height: 350, width: "100%" }} className="rounded-lg object-cover w-full" />
              
              {/* ProctorTracker Overlay */}
              {!modelsLoaded ? (
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur text-purple-300 text-xs px-2 py-1 rounded border border-purple-500/30 flex items-center gap-2">
                  <span className="animate-spin w-2 h-2 rounded-full border-t border-purple-400"></span> Loading Proctor...
                </div>
              ) : (
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur text-emerald-400 text-xs px-2 py-1 rounded border border-emerald-500/30 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div> Proctor Active
                </div>
              )}

              {warningMessage && (
                <div className="absolute top-4 left-0 right-0 mx-auto w-11/12 max-w-[90%] bg-red-600/90 backdrop-blur border border-red-400 text-white font-bold px-4 py-3 rounded-lg animate-pulse shadow-[0_0_30px_rgba(220,38,38,0.8)] z-10 text-center text-sm">
                  {warningMessage}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center h-[350px] w-full bg-gray-900 rounded-lg">
              <Mic className="w-16 h-16 text-gray-700 mb-4" />
              <p className="text-gray-500 font-medium tracking-wide">Camera is disabled</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-start rounded-lg p-5 bg-[#1e1e1e] border border-white/10 mt-4 w-full md:w-[45rem] shadow-xl">
          <div className="flex justify-between items-center w-full mb-4">
            <span className="text-gray-400 font-mono text-sm px-2">LIVE EDITOR</span>
            <select 
              value={codeLang} 
              onChange={(e) => setCodeLang(e.target.value)}
              className="bg-black text-white px-3 py-1 rounded border border-white/20 text-sm outline-none"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
          </div>
          <div className="w-full h-[350px] rounded-lg overflow-hidden border border-white/5">
            <Editor 
              height="100%" 
              theme="vs-dark"
              language={codeLang} 
              value={codeValue} 
              onChange={(value) => setCodeValue(value || "")}
              options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }}
            />
          </div>
        </div>
      )}

      {/* BUTTONS */}
      <div className="flex gap-5 mt-8 w-full justify-center">

        {answerMode === "webcam" && (
          <Button onClick={() => setWebCamEnabled((prev) => !prev)} className="bg-purple-600 hover:bg-purple-700 text-white">
            {webCamEnabled ? "Close WebCam" : "Enable WebCam"}
          </Button>
        )}

        <Button
          variant={isRecording || answerMode === "code" ? "default" : "outline"}
          className={
            answerMode === "code"
              ? "bg-green-600 hover:bg-green-700 text-white shadow-[0_0_15px_rgba(74,222,128,0.3)]"
              : isRecording
              ? "border-red-500 text-red-500 hover:bg-red-50"
              : "border-purple-500 text-purple-400 hover:bg-purple-900/20"
          }
          onClick={answerMode === "code" ? stopRecording : (isRecording ? stopRecording : startRecording)}
          disabled={loading}
        >
          {loading ? "Processing..." : answerMode === "code" ? (
            "Submit Code Answer"
          ) : isRecording ? (
            <span className="flex gap-2 items-center">
              <Mic className="animate-pulse" /> Stop Recording & Save
            </span>
          ) : (
            <span className="flex gap-2 items-center">
              <Mic /> Start Voice Response
            </span>
          )}
        </Button>

      </div>
    </div>
  );
};

export default RecordAnswerSection;