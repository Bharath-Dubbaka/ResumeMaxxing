import React from "react";

const VideoSection = () => {
   return (
      <section className="flex flex-col md:flex-row items-center justify-between px-16 py-28 rounded-lg backdrop-blur-md bg-gradient-to-br from-purple-200/60 to-yellow-50/95 animate-gradient-xy">
         {/* Video Embed */}
         <div className="w-full md:w-3/5 aspect-video mb-6 md:mb-0 shadow-2xl">
            <iframe
               className="w-full h-full rounded-md"
               src="https://www.youtube.com/embed/ACMf-BXNvYU"
               title="How to Build Your AI Resume"
               frameBorder="0"
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
               allowFullScreen
            ></iframe>
         </div>

         {/* Content Section */}
         <div className="w-full md:w-2/5 flex flex-col items-start pl-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
               See what our AI resume builder can do
            </h2>
            <p className="text-gray-600 text-lg mb-2">
               Check out how our AI Resume Writer which can create and customize
               resumes for each job description in just Minutes.
            </p>
            <p className="text-gray-600 text-lg">
               Artificial intelligence has made it possible for us to automate
               the process of creating and tailoring a resume to the job
               description in just minutes, making it nearly effortless and
               faster than before..
            </p>
         </div>
      </section>
   );
};

export default VideoSection;
