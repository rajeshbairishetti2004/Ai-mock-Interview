"use client";
import React, { useState } from "react";
import { Plus, LoaderCircle } from "lucide-react";

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
  const [loading, setLoading] = useState(false);

  const { user } = useUser();
  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/generate-question", {
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

          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              placeholder="Full Stack"
              className="bg-gray-800 text-white"
              onChange={(e) => setJobPosition(e.target.value)}
              required
            />

            <Textarea
              placeholder="React"
              className="bg-gray-800 text-white"
              onChange={(e) => setJobDesc(e.target.value)}
              required
            />

            <Input
              type="number"
              placeholder="1"
              className="bg-gray-800 text-white"
              onChange={(e) => setJobExperience(e.target.value)}
              required
            />

            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <LoaderCircle className="animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                "Start"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AddNewInterview;