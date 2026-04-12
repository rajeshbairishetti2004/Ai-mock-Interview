import { Lightbulb, Volume2 } from "lucide-react";
import React from "react";

const QuestionSection = ({ mockInterviewQuestion, activeQuestionIndex }) => {
  const textToSpeech = (text) => {
    if ("speechSynthesis" in window) {
      const speech = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(speech);
    } else {
      alert("Sorry, your browser does not support text to speech.");
    }
  };

  return (
    mockInterviewQuestion && (
      <div className="flex flex-col justify-between p-5 border rounded-lg my-1 bg-white">
        
        {/* Question Number Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {mockInterviewQuestion.map((question, index) => (
            <h2
              key={index}
              className={`p-2 rounded-full text-center text-xs md:text-sm cursor-pointer md:block hidden ${
                activeQuestionIndex === index
                  ? "bg-black text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              Question #{index + 1}
            </h2>
          ))}
        </div>

        {/* Phase/Round Badge (For Campaign Mode) */}
        {mockInterviewQuestion[activeQuestionIndex]?.round && (
          <div className="inline-block px-4 py-1.5 mt-4 w-fit text-xs md:text-sm font-bold text-yellow-900 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full shadow-md border border-yellow-300 tracking-wide uppercase">
            🚀 {mockInterviewQuestion[activeQuestionIndex].round}
          </div>
        )}

        {/* Main Question */}
        <h2 className="my-5 text-md md:text-lg text-black font-semibold">
          {mockInterviewQuestion[activeQuestionIndex]?.question}
        </h2>

        {/* Text to Speech */}
        <Volume2
          className="cursor-pointer text-black"
          onClick={() =>
            textToSpeech(
              mockInterviewQuestion[activeQuestionIndex]?.question
            )
          }
        />

        {/* Info Box */}
        <div className="border rounded-lg p-5 bg-blue-100 mt-10 md:block hidden">
          <h2 className="flex gap-2 items-center text-blue-800">
            <Lightbulb />
            <strong>Note:</strong>
          </h2>
          <h2 className="text-sm text-blue-600 my-2">
            {process.env.NEXT_PUBLIC_QUESTION_NOTE}
          </h2>
        </div>
      </div>
    )
  );
};

export default QuestionSection;