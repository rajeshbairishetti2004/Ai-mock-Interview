import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sparkles, Target, Zap, Bot } from "lucide-react";

export default async function Page() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <section className="min-h-screen flex bg-[#050505] text-white relative overflow-hidden font-sans">
      
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[150px] pointer-events-none" />

      {/* LEFT SIDE: Brand & Features */}
      <div className="hidden lg:flex flex-col justify-center px-16 xl:px-24 w-1/2 relative z-10">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 w-max mb-6">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-purple-200">InterviewAI Platform</span>
        </div>

        <h1 className="text-5xl xl:text-6xl font-extrabold mb-6 leading-tight">
          Step Into Your <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
            Future.
          </span>
        </h1>

        <p className="text-xl text-gray-400 mb-12 max-w-lg leading-relaxed font-light">
          Master your next technical round with AI-powered mock interviews, instant grading, and real-time S.T.A.R. framework feedback.
        </p>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white/[0.05] border border-white/10 text-emerald-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-200">Real-time AI Feedback</h3>
              <p className="text-sm text-gray-500">Instant corrections on your technical performance.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white/[0.05] border border-white/10 text-blue-400">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-200">Dynamic Interview Personas</h3>
              <p className="text-sm text-gray-500">Practice with strict tech leads or friendly HR managers.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white/[0.05] border border-white/10 text-purple-400">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-200">Live Code Editor</h3>
              <p className="text-sm text-gray-500">Built-in Monaco editor for JavaScript, Python, and more.</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Auth Card */}
      <div className="flex items-center justify-center w-full lg:w-1/2 p-10 relative z-10">
        
        {/* Glow behind the card */}
        <div className="absolute w-[400px] h-[400px] bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />

        <div className="
          w-full max-w-md
          p-2 sm:p-8
          rounded-3xl
          backdrop-blur-2xl
          bg-black/40
          border border-white/10
          shadow-2xl
        ">
          <SignUp
            appearance={{
              layout: {
                socialButtonsPlacement: "bottom",
                socialButtonsVariant: "iconButton",
              },
              elements: {
                rootBox: "w-full flex justify-center",
                card: "bg-transparent shadow-none w-full",
                headerTitle: "text-white text-3xl font-bold font-sans",
                headerSubtitle: "text-gray-400 font-sans mt-2",
                formFieldLabel: "text-gray-300 font-medium",
                formFieldInput: "bg-[#0A0A0A] border border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500 transition-colors h-11",
                formButtonPrimary: "bg-white text-black hover:bg-gray-200 font-semibold h-11 transition-colors",
                socialButtonsBlockButton: "border border-white/10 bg-[#0A0A0A] text-white hover:bg-white/5 h-11 transition-colors",
                dividerLine: "bg-white/10",
                dividerText: "text-gray-500 bg-transparent",
                footer: "bg-transparent",
                footerActionText: "text-gray-400",
                footerActionLink: "text-purple-400 hover:text-purple-300 font-semibold",
                identityPreviewText: "text-white",
                identityPreviewEditButtonIcon: "text-gray-400 hover:text-white"
              },
            }}
          />
        </div>
      </div>

    </section>
  );
}