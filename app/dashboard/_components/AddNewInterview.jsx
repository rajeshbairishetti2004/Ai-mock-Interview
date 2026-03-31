"use client";
import React, { useState } from "react";
import { Plus, LoaderCircle, UploadCloud, FileText, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

function AddNewInterview() {
  const [openDialog, setOpenDialog] = useState(false);
  const [jobPosition, setJobPosition] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobExperience, setJobExperience] = useState("");
  const [file, setFile] = useState(null);
  const [questionType, setQuestionType] = useState("Both (Hybrid Intelligent Mode)");
  const [questionCount, setQuestionCount] = useState(5);
  const [persona, setPersona] = useState("Standard");
  const [loading, setLoading] = useState(false);

  const { user } = useUser();
  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let extractedResumeText = "";

      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const parseRes = await fetch("/api/parse-resume", {
          method: "POST",
          body: formData,
        });

        const parseData = await parseRes.json();
        if (!parseRes.ok) throw new Error(parseData.error || "Failed to parse resume");
        extractedResumeText = parseData.text;
      }

      const res = await fetch("/api/generate-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobPosition,
          jobDesc,
          jobExperience,
          resumeText: extractedResumeText,
          questionType: file ? questionType : "General",
          questionCount,
          persona,
          createdBy: user?.primaryEmailAddress?.emailAddress,
        }),
      });

      const data = await res.json();

      console.log("API RESPONSE:", data); // ✅ DEBUG

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate");
      }

      // ❌ If mockId missing → stop
      if (!data?.mockId) {
        alert("❌ mockId not received from API");
        console.error("Missing mockId:", data);
        return;
      }

      // ✅ SUCCESS
      setOpenDialog(false);

      console.log("Redirecting to:", `/dashboard/interview/${data.mockId}`);

      router.push(`/dashboard/interview/${data.mockId}`);

    } catch (error) {
      console.error("❌ ERROR:", error);
      alert("Something went wrong. Check console.");
    }

    setLoading(false);
  };

  return (
    <>
      <div
        onClick={() => setOpenDialog(true)}
        className="flex flex-col items-center justify-center h-40 rounded-2xl cursor-pointer border border-purple-400/30 bg-gradient-to-br from-[#3b0764]/70 via-[#4c1d95]/70 to-[#1e3a8a]/70 text-white"
      >
        <Plus size={32} className="mb-2 text-cyan-300" />
        <span>Add New Interview</span>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="bg-black text-white">
          <DialogHeader>
            <DialogTitle>Create AI Mock Interview</DialogTitle>
            <DialogDescription>
              Enter job details
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-4 mt-2 font-sans">
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs text-gray-400 font-semibold mb-1 block">Job Role / Position</label>
                <Input
                  placeholder="e.g. Full Stack Developer"
                  className="bg-black/50 border-white/10 text-white focus:border-purple-500 h-11"
                  onChange={(e) => setJobPosition(e.target.value)}
                  required
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs text-gray-400 font-semibold mb-1 block">Years of Experience</label>
                <Input
                  type="number"
                  placeholder="e.g. 3"
                  className="bg-black/50 border-white/10 text-white focus:border-purple-500 h-11"
                  onChange={(e) => setJobExperience(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 font-semibold mb-1 block">Tech Stack / Job Description</label>
              <Textarea
                placeholder="e.g. React, Node.js, PostgreSQL, AWS"
                className="bg-black/50 border-white/10 text-white focus:border-purple-500 min-h-[80px]"
                onChange={(e) => setJobDesc(e.target.value)}
                required
              />
            </div>

            {!file ? (
              <label 
                className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-gray-600/50 rounded-xl cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] hover:border-purple-500/50 transition-all group"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const selected = e.dataTransfer.files[0];
                  if (selected && (selected.type === "application/pdf" || selected.name.endsWith(".docx"))) {
                    setFile(selected);
                    setQuestionType("Both (Hybrid Intelligent Mode)");
                  }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5 group-hover:bg-purple-500/20 transition-colors">
                     <UploadCloud className="w-5 h-5 text-gray-400 group-hover:text-purple-400" />
                  </div>
                  <div>
                     <p className="text-sm text-gray-300 font-medium">Upload Resume (Optional)</p>
                     <p className="text-xs text-gray-500 inline-block">PDF or DOCX for tailored questions</p>
                  </div>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx"
                  onChange={(e) => {
                    const selected = e.target.files[0];
                    if (selected) {
                      setFile(selected);
                      setQuestionType("Both (Hybrid Intelligent Mode)");
                    }
                  }}
                />
              </label>
            ) : (
              <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="p-2 rounded-lg bg-emerald-500/20">
                    <FileText className="text-emerald-400 w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-emerald-200 truncate pr-4">{file.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setQuestionType("General");
                  }}
                  className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors text-gray-400 hover:text-red-400 shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs text-gray-400 font-semibold mb-1 block">Question Count</label>
                <select
                  className="flex h-11 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  required
                >
                  <option value="5" className="bg-gray-900">5 Questions</option>
                  <option value="10" className="bg-gray-900">10 Questions</option>
                  <option value="15" className="bg-gray-900">15 Questions</option>
                  <option value="20" className="bg-gray-900">20 Questions</option>
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs text-gray-400 font-semibold mb-1 block">Interviewer Persona</label>
                <select
                  className="flex h-11 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={persona}
                  onChange={(e) => setPersona(e.target.value)}
                  required
                >
                  <option value="Standard" className="bg-gray-900">Standard</option>
                  <option value="Strict Technical Lead" className="bg-gray-900">Tech Lead</option>
                  <option value="Friendly HR Manager" className="bg-gray-900">Friendly HR</option>
                  <option value="Startup Founder" className="bg-gray-900">Startup Founder</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 font-semibold mb-1 block">Interview Mode</label>
              <select
                className="flex h-11 w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                value={file ? questionType : "General"}
                onChange={(e) => setQuestionType(e.target.value)}
                disabled={!file}
                required
              >
                <option value="General" className="bg-gray-900">General Questions (Active without Resume)</option>
                {file && (
                  <>
                    <option value="Resume-Based" className="bg-gray-900">Strictly Resume-Based</option>
                    <option value="Both (Hybrid Intelligent Mode)" className="bg-gray-900">Hybrid (Resume + General)</option>
                  </>
                )}
              </select>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-cyan-400 hover:opacity-90 text-white font-bold h-12 rounded-xl mt-4">
              {loading ? (
                <>
                  <LoaderCircle className="animate-spin mr-2" />
                  Generating Questions...
                </>
              ) : (
                "Start Interview"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AddNewInterview;