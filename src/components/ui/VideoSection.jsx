import React from "react";

const VideoSection = () => {
   return (
      <section className="flex flex-col md:flex-row items-center justify-between p-16 rounded-lg shadow-lg">
         {/* Video Embed */}
         <div className="w-full md:w-3/5 aspect-video mb-6 md:mb-0">
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
            <p className="text-gray-600 text-lg">
               Learn how to create a mistake-free resume in under 10 minutes
               with our award-winning Resume Builder.
            </p>
         </div>
      </section>
   );
};

export default VideoSection;
