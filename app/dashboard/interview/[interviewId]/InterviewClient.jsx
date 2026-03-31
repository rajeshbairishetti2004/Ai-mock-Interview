"use client";

import React, { useContext } from "react";
import { Lightbulb, WebcamIcon, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import Webcam from "react-webcam";
import Link from "next/link";
import { WebCamContext } from "@/context/WebCamContext";

const InterviewClient = ({ interviewData }) => {
  const { webCamEnabled, setWebCamEnabled } = useContext(WebCamContext);

  return (
    <div className="my-10">
      <h2 className="font-bold text-2xl text-center">
        Let's Get Started
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

        <div className="flex flex-col my-5 gap-5">
          <div className="flex flex-col p-5 border rounded-lg gap-5">
            <h2><strong>Job Role: </strong>{interviewData?.jobPosition}</h2>
            <h2><strong>Description: </strong>{interviewData?.jobDesc}</h2>
            <h2><strong>Experience: </strong>{interviewData?.jobExperience}</h2>
          </div>

          <div className="p-5 border rounded-lg bg-yellow-100">
            <h2 className="flex gap-2 items-center text-yellow-700 mb-2">
              <Lightbulb />
              <strong>Information</strong>
            </h2>
            <h2 className="mt-3 text-yellow-500">
              {process.env.NEXT_PUBLIC_INFORMATION}
            </h2>
          </div>
        </div>

        <div>
          {webCamEnabled ? (
            <Webcam height={300} width={300} mirrored />
          ) : (
            <WebcamIcon className="h-72 w-full p-20 bg-secondary rounded-lg border" />
          )}

          <Button
            className="w-full mt-3"
            onClick={() => setWebCamEnabled((prev) => !prev)}
          >
            {webCamEnabled ? "Close WebCam" : "Enable WebCam"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end mt-5 gap-4">
        {interviewData?.resumeText && (
          <Link href={`/dashboard/interview/${interviewData?.mockId}/resume-analysis`}>
             <Button className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg flex gap-2 shadow-purple-500/30 border border-purple-400/50">
              <BarChart size={18} />
              Analyze Resume (Skill Gaps)
            </Button>
          </Link>
        )}
        <Link href={`/dashboard/interview/${interviewData?.mockId}/start`}>
          <Button className="w-full sm:w-auto">Start Interview</Button>
        </Link>
      </div>
    </div>
  );
};

export default InterviewClient;