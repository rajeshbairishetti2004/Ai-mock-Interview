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

  const [transcript, setTranscript] = useState("");
  const [recordingStartTime, setRecordingStartTime] = useState(null);

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

        const answerText = transcript;

        console.log("🗣️ TRANSCRIPT:", answerText);

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
    <div className="flex flex-col items-center justify-center">

      {/* CAMERA */}
      <div className="flex flex-col items-center rounded-lg p-5 bg-black mt-4 w-[30rem]">
        {webCamEnabled ? (
          <Webcam mirrored style={{ height: 250, width: "100%" }} />
        ) : (
          <Image src="/camera.jpg" width={200} height={200} alt="camera" />
        )}
      </div>

      {/* BUTTONS */}
      <div className="flex gap-5 mt-6">

        <Button onClick={() => setWebCamEnabled((prev) => !prev)}>
          {webCamEnabled ? "Close WebCam" : "Enable WebCam"}
        </Button>

        <Button
          variant="outline"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={loading}
        >
          {isRecording ? (
            <span className="text-red-400 flex gap-2">
              <Mic /> Stop Recording
            </span>
          ) : (
            "Record Answer"
          )}
        </Button>

      </div>
    </div>
  );
};

export default RecordAnswerSection;