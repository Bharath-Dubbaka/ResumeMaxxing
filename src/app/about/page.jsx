// components/About.tsx
import React from "react";
import { Briefcase, FileText, Download } from "lucide-react";

const About = () => {
   return (
      <section className=" py-28 px-8 bg-gradient-to-br from-purple-200/60 via-pink-50 to-blue-200/60 animate-gradient-xy">
         <div className="max-w-6xl mx-auto">
            <h2 className="text-center text-4xl font-bold text-gray-900">
               How <span className="text-blue-600">ResumeOnFly</span> Works
            </h2>
            <p className="text-center mt-4 text-lg text-gray-600">
               Build professional resumes effortlessly with AI-powered
               precision.
            </p>

            <div className="mt-12 grid gap-10 md:grid-cols-3 ">
               {/* Step 1 */}
               <div className="flex flex-col backdrop-blur-md bg-teal-50/95 border border-teal-500/10  items-center text-center space-y-4 rounded-lg shadow-lg p-8">
                  <div className="bg-blue-100 p-4 rounded-full">
                     <Briefcase className="text-blue-600 w-8 h-8" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">
                     Step 1: Analyze Job Description
                  </h3>
                  <p className="mt-2 text-center text-gray-600">
                     Our AI analyzes the job description, extracts technical
                     skills, maps them to your experience, and compares
                     requirements with your profile.
                  </p>
                  <ul className="mt-4 text-sm text-gray-700 list-disc list-inside">
                     <li>AI-powered job description analysis</li>
                     <li>Automatic technical skills extraction</li>
                     <li>Skill mapping with work experiences</li>
                     <li>Experience requirement detection</li>
                  </ul>
               </div>

               {/* Step 2 */}
               <div className="flex flex-col backdrop-blur-md bg-teal-50/95 border border-teal-500/10  items-center text-center space-y-4 rounded-lg shadow-lg p-8">
                  {" "}
                  <div className="bg-green-100 p-4 rounded-full">
                     <FileText className="text-green-600 w-8 h-8" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">
                     Step 2: Generate Resume Content
                  </h3>
                  <p className="mt-2 text-center text-gray-600">
                     Generate a polished professional summary and smart
                     responsibilities tailored to your skills and experience.
                  </p>
                  <ul className="mt-4 text-sm text-gray-700 list-disc list-inside">
                     <li>AI-generated professional summary</li>
                     <li>Smart responsibility generation</li>
                     <li>Skills intelligently mapped to experiences</li>
                     <li>Business impact-focused titles</li>
                  </ul>
               </div>

               {/* Step 3 */}
               <div className="flex flex-col backdrop-blur-md bg-teal-50/95 border border-teal-500/10  items-center text-center space-y-4 rounded-lg shadow-lg p-8">
                  {" "}
                  <div className="bg-purple-100 p-4 rounded-full">
                     <Download className="text-purple-600 w-8 h-8" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">
                     Step 3: Download & Apply
                  </h3>
                  <p className="mt-2 text-center text-gray-600">
                     Preview, download, and customize your professional resume
                     with formatted sections ready for use.
                  </p>
                  <ul className="mt-4 text-sm text-gray-700 list-disc list-inside">
                     <li>Professional resume preview</li>
                     <li>Word document download</li>
                     <li>Formatted sections for all details</li>
                     <li>Ready for final customization</li>
                  </ul>
               </div>
            </div>
         </div>
      </section>
   );
};

export default About;
