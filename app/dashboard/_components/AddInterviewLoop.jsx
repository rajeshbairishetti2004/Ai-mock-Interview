"use client";
import React, { useState } from "react";
import { CopyPlus, LoaderCircle } from "lucide-react";

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

function AddInterviewLoop() {
  const [openDialog, setOpenDialog] = useState(false);
  const [jobPosition, setJobPosition] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [jobExperience, setJobExperience] = useState("");
  const [loading, setLoading] = useState(false);

  const { user } = useUser();
  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/generate-loop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobPosition,
          jobDesc,
          jobExperience,
          createdBy: user?.primaryEmailAddress?.emailAddress,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate");
      }

      if (!data?.mockId) {
        alert("❌ mockId not received from API");
        return;
      }

      setOpenDialog(false);
      router.push(`/dashboard/interview/${data.mockId}`);
    } catch (error) {
      console.error("❌ ERROR:", error);
      alert("Something went wrong generating the loop. Check console.");
    }

    setLoading(false);
  };

  return (
    <>
      <div
        onClick={() => setOpenDialog(true)}
        className="flex flex-col items-center justify-center h-full min-h-[160px] rounded-3xl cursor-pointer border border-yellow-500/40 bg-gradient-to-br from-[#422006] via-[#713f12] to-[#0f172a] text-white shadow-[0_0_40px_rgba(234,179,8,0.2)] hover:scale-105 hover:shadow-[0_0_60px_rgba(234,179,8,0.4)] transition-all duration-300 p-8"
      >
        <CopyPlus size={32} className="mb-3 text-yellow-400" />
        <span className="font-semibold text-xl text-yellow-100 text-center">Start Campaign Loop</span>
        <span className="text-sm text-yellow-300/70 mt-2 text-center">15-Question Elite Multi-Stage Phase</span>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="bg-black text-white border border-yellow-500/30">
          <DialogHeader>
            <DialogTitle className="text-yellow-400">Assemble Interview Loop</DialogTitle>
            <DialogDescription className="text-gray-400">
              This generates a grueling 3-stage interview (Behavioral, Technical, Problem Solving) for elite preparation.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-yellow-100/70 mb-1 block">Job Role</label>
              <Input
                placeholder="Senior Backend Engineer"
                className="bg-gray-900 border-gray-700 text-white"
                onChange={(e) => setJobPosition(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm text-yellow-100/70 mb-1 block">Tech Stack / Core Skills</label>
              <Textarea
                placeholder="Node.js, PostgreSQL, AWS, Microservices"
                className="bg-gray-900 border-gray-700 text-white"
                onChange={(e) => setJobDesc(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm text-yellow-100/70 mb-1 block">Years of Experience</label>
              <Input
                type="number"
                placeholder="e.g. 5"
                className="bg-gray-900 border-gray-700 text-white"
                onChange={(e) => setJobExperience(e.target.value)}
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold">
              {loading ? (
                <>
                  <LoaderCircle className="animate-spin mr-2" />
                  Building Architecture...
                </>
              ) : (
                "Assemble Loop"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AddInterviewLoop;
