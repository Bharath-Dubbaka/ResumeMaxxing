import React from "react";

const VideoSection = () => {
   return (
      <div className="backdrop-blur-md bg-gradient-to-br from-purple-200/60 to-yellow-50/95 animate-gradient-xy">
         <div className="text-center mb-2 pt-8">
            <h2 className="text-4xl font-bold text-center mb-2 underline">
               How this works !
            </h2>
            <p className="text-xl text-gray-600 mb-4">
               Our streamlined four-step process transforms your resume creation
            </p>
            <p className="text-gray-500 max-w-[80%] mx-auto">
               <span className="font-bold"> Centralized Master Profile</span>,
               <span className="hidden sm:inline">
                  securely storing your professional details and reusable
                  skills, eliminating repetitive entries.{" "}
               </span>
               <span className="font-bold">Smart Job Description Analysis</span>{" "}
               <span className="hidden sm:inline">
                  uses AI to extract key requirements and match them to profile,
                  ensuring your resume is tailored to each opportunity.
               </span>
               <span className="font-bold">AI-Optimized Resume Generation</span>{" "}
               <span className="hidden sm:inline">
                  automatically creates targeted summaries and dynamic
                  responsibilities, saving you hours of manual work.{" "}
               </span>
               <span className="font-bold">
                  Finally, Professional Export & Templates{" "}
               </span>
               <span className="hidden sm:inline">
                  provide ATS-friendly formats, allowing you to present a
                  polished, impactful resume every time."
               </span>
            </p>
         </div>
         <section className="flex flex-col md:flex-row items-center justify-between  px-4 py-8 md:px-16 md:pb-28 rounded-lg ">
            {/* Video Embed */}
            <div className="w-full md:w-3/5 aspect-video mb-6 md:mb-0 shadow-2xl">
               <iframe
                  className="w-full h-full rounded-md"
                  src="https://www.youtube.com/embed/UiOkeCEpL94?autoplay=1&mute=1"
                  title="How to Build Your AI Resume"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
               ></iframe>
            </div>

            {/* Content Section */}
            <div className="w-full md:w-2/5 flex flex-col items-start pl-4">
               <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                  {/* See what our AI resume builder can do ???  */}
                  Update your resume according to Job description in Minutes
               </h2>
               <p className="text-gray-600 text-lg mb-2">
                  Tired of updating resume for each and every Job Description
                  ??? let our AI do that in just Minutes for FREE !!!
               </p>
               <p className="text-gray-600 text-lg">
                  Artificial intelligence has made it possible for us to
                  automate the process of creating and tailoring a resume to the
                  job description in just minutes, making it nearly effortless
                  and faster than before..
               </p>
            </div>
         </section>
      </div>
   );
};

export default VideoSection;
