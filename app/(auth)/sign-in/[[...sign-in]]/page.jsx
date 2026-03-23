import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <section className="min-h-screen flex bg-gradient-to-r from-[#06122b] via-[#0f2b57] to-[#5b21b6] text-white">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex flex-col justify-center px-24 w-1/2">

        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          Step Into Your Future 🚀
        </h1>

        <p className="text-lg text-gray-300 mb-10 max-w-lg">
          AI-powered mock interviews designed to prepare you for
          placements, job drives and real-world technical rounds.
        </p>

        <ul className="space-y-4 text-cyan-300 text-lg">
          <li>✔ Real-time AI feedback</li>
          <li>✔ Industry-level interview simulation</li>
          <li>✔ Placement-focused preparation</li>
        </ul>

      </div>


      {/* RIGHT SIDE LOGIN CARD */}
      <div className="flex items-center justify-center w-full lg:w-1/2 p-10">

        <div className="
        w-[420px]
        p-10
        rounded-3xl
        backdrop-blur-xl
        bg-gradient-to-br
        from-[#3b0764]/70
        via-[#4c1d95]/70
        to-[#1e3a8a]/70
        shadow-[0_0_60px_rgba(168,85,247,0.4)]
        ">

          <SignIn
            appearance={{
              elements: {

                card: "bg-transparent shadow-none",

                headerTitle: "text-white text-2xl",
                headerSubtitle: "text-gray-300",

                socialButtonsBlockButton:
                  "bg-white text-black hover:bg-gray-200",

                formButtonPrimary:
                  "bg-gradient-to-r from-purple-500 to-cyan-400 hover:opacity-90",

                formFieldInput:
                  "bg-white/20 text-white placeholder:text-gray-300 border-none",

                footer: "bg-transparent text-gray-300",

                footerActionLink:
                  "text-cyan-400 hover:text-cyan-300",

                identityPreviewText: "text-white",

                dividerLine: "bg-white/20",

                dividerText: "text-gray-300",

              },
            }}
          />

        </div>

      </div>

    </section>
  );
}