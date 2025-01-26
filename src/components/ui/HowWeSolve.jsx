import React from "react";
import {
   Cpu,
   ClipboardCheck,
   Settings,
   Layout,
   File,
   Edit3,
} from "lucide-react";

const HowWeSolve = () => {
   return (
      <section className="py-20 bg-white rounded-lg bg-gradient-to-br from-teal-100/50  to-yellow-50/60 animate-gradient-xy">
         <h2 className="text-4xl font-extrabold text-center mb-6 text-gray-800">
            How We Solve These Problems
         </h2>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
            <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
               <ClipboardCheck className="h-10 w-10 text-green-600 mb-4" />
               <h3 className="text-lg font-semibold mb-2 text-center">
                  Start with a Master Resume
               </h3>
               <p className="text-gray-600 text-center ">
                  Keep everything in one place! Enter your contact info,
                  education, work experience, and custom responsibilities just
                  once. ResumeOnFly becomes your central hub for AI-generated
                  and reusable content, tailored to your needs.
               </p>
            </div>
            <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
               <Cpu className="h-10 w-10 text-blue-500 mb-4" />
               <h3 className="text-lg font-semibold mb-2 text-center">
                  AI-Powered Job Description Analysis
                  <span className="ml-2 bg-gradient-to-br from-orange-400 via-blue-800 to-pink-500 text-white px-2 py-1 rounded-md text-sm font-medium">
                     NEW FEATURE
                  </span>
               </h3>
               <p className="text-gray-600 text-center">
                  Paste a job description, and let our AI work its magic! It
                  analyzes key skills and generate role-specific
                  responsibilities that can customize and map those skills to
                  specific work experiences, This feature takes your resume game
                  to the next level.
               </p>
            </div>
            <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
               <Settings className="h-10 w-10 text-orange-500 mb-4" />
               <h3 className="text-lg font-semibold mb-2 text-center">
                  Generate and Save Custom Responsibilities
                  <span className="ml-2 bg-gradient-to-br from-orange-400 via-blue-800 to-pink-500 text-white px-2 py-1 rounded-md text-sm font-medium">
                     NEW FEATURE
                  </span>
               </h3>
               <p className="text-gray-600 text-center">
                  Tired of repeating “responsible for X” over and over? Save
                  AI-generated responsibilities or tweak them to reuse for any
                  job or industry. ResumeOnFly works for you, making resume
                  customization faster and smarter.
               </p>
            </div>
            <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
               <File className="h-10 w-10 text-purple-600 mb-4" />
               <h3 className="text-lg font-semibold mb-2 text-center">
                  Generate ATS-Friendly Resumes
               </h3>
               <p className="text-gray-600 text-center">
                  Built with recruiter-approved, ATS-compatible formats. With
                  AI-analyzed keywords from job descriptions, your resume is
                  optimized for better visibility, making you stand out in
                  recruiter queries and ATS storage.
               </p>
            </div>
            <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
               <Layout className="h-10 w-10 text-yellow-600 mb-4" />
               <h3 className="text-lg font-semibold mb-2 text-center">
                  “Market-Preferred” Resume Structure
               </h3>
               <p className="text-gray-600 text-center">
                  With decades of professional recruitment experience, we’ve
                  cracked the code for what recruiters and agencies
                  want—ensuring your resume has the right structure, format, and
                  style.
               </p>
            </div>
            <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
               <Edit3 className="h-10 w-10 text-red-500 mb-4" />
               <h3 className="text-lg font-semibold mb-2 text-center">
                  Edit Without Hassle
               </h3>
               <p className="text-gray-600 text-center">
                  Fine-tune your resume effortlessly using our editor mode. Make
                  quick updates and download your resume in Word or PDF format
                  for a professional finish.
               </p>
            </div>
         </div>
      </section>
   );
};

export default HowWeSolve;
