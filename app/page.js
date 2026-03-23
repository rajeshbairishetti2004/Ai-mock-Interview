"use client"

import Link from "next/link"
import { motion } from "framer-motion"

export default function Home() {

  return (
    <main className="min-h-screen bg-black text-white">

      {/* Navbar */}
      <nav className="flex justify-between items-center px-10 py-6 absolute w-full z-20">

        <h1 className="text-xl font-bold">
          AI Mock Interview
        </h1>

        <div className="flex gap-6 items-center">

          <a href="#features" className="hover:text-blue-400">
            Features
          </a>

          <Link href="/sign-in">
            Login
          </Link>

          <Link href="/sign-up">
            <button className="bg-blue-600 px-4 py-2 rounded-lg">
              Sign Up
            </button>
          </Link>

        </div>

      </nav>


      {/* Hero Section */}
      <section
        className="min-h-screen flex items-center bg-cover bg-center"
        style={{ backgroundImage: "url('/ai-bg.jpg')" }}
      >

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 px-10">

          <motion.div
            initial={{ opacity:0, y:30 }}
            animate={{ opacity:1, y:0 }}
            transition={{ duration:1 }}
          >

            <h1 className="text-5xl font-bold mb-6">
              AI Simulation Platform
            </h1>

            <p className="text-gray-300 mb-6">
              Experience the future of AI powered mock interviews
            </p>

            <div className="flex gap-4">

              <Link href="/sign-up">
                <button className="bg-blue-500 px-6 py-3 rounded-lg">
                  Get Started
                </button>
              </Link>

              <a href="#features">
                <button className="border px-6 py-3 rounded-lg">
                  Learn More
                </button>
              </a>

            </div>

          </motion.div>

        </div>

      </section>


      {/* Features Section */}
      <section id="features" className="py-20 bg-black">

        <div className="max-w-6xl mx-auto text-center">

          <h2 className="text-4xl font-bold mb-12">
            Features
          </h2>


          <div className="grid md:grid-cols-3 gap-8">

            <div className="bg-gradient-to-b from-blue-900 to-purple-900 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-2">
                Realistic AI Interviews
              </h3>
              <p>
                Engage in natural AI driven mock interviews.
              </p>
            </div>


            <div className="bg-gradient-to-b from-blue-900 to-purple-900 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-2">
                Customizable Scenarios
              </h3>
              <p>
                Tailor interviews based on your job role.
              </p>
            </div>


            <div className="bg-gradient-to-b from-blue-900 to-purple-900 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-2">
                Instant Feedback
              </h3>
              <p>
                Receive AI powered evaluation instantly.
              </p>
            </div>

          </div>

        </div>

      </section>


    </main>
  )
}