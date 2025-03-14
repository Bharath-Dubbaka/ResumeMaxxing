import React from "react";
import { Briefcase, Clock, FileText, AlertCircle, Frown } from "lucide-react";

// Define problems as an array of objects
const problems = [
   {
      icon: <Briefcase className="h-10 w-10 text-indigo-600 mb-4" />,
      title: "Tailoring Resumes",
      description:
         "Are you tired of rewriting your resume for every job application? The endless tweaks to match job descriptions can quickly turn into a full-time job.",
   },
   {
      icon: <Clock className="h-10 w-10 text-blue-500 mb-4" />,
      title: "ATS Compatibility",
      description:
         "Do you worry about whether your resume will pass ATS filters? Missing keywords, messy formatting, or incorrect file types could cost you a dream opportunity.",
   },
   {
      icon: <FileText className="h-10 w-10 text-yellow-500 mb-4" />,
      title: "The Perfect Resume Structure",
      description:
         "Should you use Word or PDF? What about fonts, alignment, or formats that recruiters prefer? Figuring it all out can leave you feeling stuck and uncertain.",
   },
   {
      icon: <AlertCircle className="h-10 w-10 text-red-500 mb-4" />,
      title: "Keeping a Master Resume",
      description:
         "Maintaining a master resume and creating tailored versions for different scenarios adds hassle and confusion. It’s a juggling act that never seems to end.",
   },
   {
      icon: <Frown className="h-10 w-10 text-gray-700 mb-4" />,
      title: "Time Waste",
      description:
         "Are you spending hours tailoring resumes when you could be prepping for interviews or upskilling? Your time is too valuable to waste on repetitive tasks.",
   },
];

const ProblemsWeSolve = () => {
   return (
      <section className="py-28  bg-gradient-to-br from-pink-100/80 to-teal-100/50 animate-gradient-xy">
         <h2 className="text-4xl font-extrabold text-center mb-10 text-gray-800">
            Problems We Solve
         </h2>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto px-6">
            {problems.map((problem, index) => (
               <div
                  key={index}
                  className="group relative bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 border border-gray-200 hover:border-gray-400"
               >
                  <div className="absolute -top-5 -left-5 rounded-full bg-gray-50 p-3 shadow-md group-hover:scale-105 transition-transform duration-300">
                     {problem.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-800 text-center">
                     {problem.title}
                  </h3>
                  <p className="text-gray-600 text-center">
                     {problem.description}
                  </p>
               </div>
            ))}
         </div>
      </section>
   );
};

export default ProblemsWeSolve;
