import React from "react";

const About = () => {
   return (
      <div className="py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-yellow-50/95 via-pink-50 to-blue-200/60 animate-gradient-xy">
         <div className="max-w-4xl mx-auto">
            <h2 className="flex flex-col text-4xl font-bold text-center mb-12 underline">
               About ResumeOnFly{" "}
               <span className="text-sm mt-2 text-blue-600 font-medium">
                  (prod by CVtoSalary)
               </span>
            </h2>

            <div className="space-y-12">
               {/* Problems Section */}
               <section className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-blue-100/50">
                  <h2 className="text-3xl font-bold mb-6 text-blue-800">
                     Problems We Solve
                  </h2>
                  <div className="space-y-6">
                     {[
                        {
                           title: "Tailoring Resumes",
                           content:
                              "Adjusting resumes for every job description is already exhausting. Tailoring them for recruiters too? That is next level. And we have all been told to “keep a master resume,” but how do you manage it without drowning in multiple files?",
                        },
                        {
                           title: "ATS Compatibility",
                           content:
                              "Recruiters often ask for resumes in Word format as it is better suited for most ATS globally. Issues like readability, format, and the right keywords can make or break your chances.",
                        },
                        {
                           title: "The “Perfect Resume Structure”",
                           content:
                              "Should I use Word or PDF? What should be the format, font, or alignment? These endless doubts add unnecessary confusion.",
                        },
                        {
                           title: "Keeping a Master Resume",
                           content:
                              "To solve these problems, we are told to maintain a master resume and make multiple copies for different jobs, skills, or scenarios. But this approach often leads to even more hassle and confusion.",
                        },
                     ].map((item, index) => (
                        <div key={index} className="group">
                           <h3 className="text-xl font-semibold mb-2 text-gray-800 flex items-center">
                              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                              {item.title}
                           </h3>
                           <p className="text-gray-600 leading-relaxed">
                              {item.content}
                           </p>
                        </div>
                     ))}
                  </div>
               </section>

               {/* Solutions Section */}
               <section className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-blue-100/50">
                  <h2 className="text-3xl font-bold mb-6 text-emerald-800">
                     Our Solutions
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2">
                     {[
                        {
                           title: "Master Resume Hub",
                           content:
                              "Central hub for basic info, custom responsibilities, and AI-generated content",
                        },
                        {
                           title: "Smart Job Analysis",
                           content:
                              "AI extracts key skills from job descriptions and generates targeted content",
                        },
                        {
                           title: "Custom Responsibilities",
                           content:
                              "Save and reuse tailored position descriptions across applications",
                        },
                        {
                           title: "ATS-Friendly Formats",
                           content:
                              "Recruiter-approved structures with optimal keyword integration",
                        },
                        {
                           title: "Market-Proven Structure",
                           content:
                              "Decades of recruitment experience baked into every template",
                        },
                        {
                           title: "Effortless Editing",
                           content:
                              "Intuitive editor with Word/PDF export capabilities",
                        },
                     ].map((item, index) => (
                        <div
                           key={index}
                           className="p-4 bg-white rounded-lg border-l-4 border-blue-200 shadow-sm hover:border-blue-400 transition-colors"
                        >
                           <h3 className="font-semibold text-lg mb-2 text-gray-800">
                              {item.title}
                           </h3>
                           <p className="text-gray-600 text-sm">
                              {item.content}
                           </p>
                        </div>
                     ))}
                  </div>
               </section>

               {/* Why It Matters */}
               <section className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-blue-100/50">
                  <h2 className="text-3xl font-bold mb-6 text-purple-800">
                     Why It Matters
                  </h2>
                  <div className="space-y-6">
                     <p className="text-lg text-gray-700 leading-relaxed">
                        Candidates are already juggling job boards,
                        applications, and life. ResumeOnFly bridges the gap
                        between real-world struggles and recruiter expectations,
                        so you can focus on landing that job.
                     </p>

                     <div className="grid gap-4 md:grid-cols-2">
                        {[
                           {
                              icon: "💼",
                              title: "Increased Callbacks",
                              content: "Tailored resumes get 3x more responses",
                           },
                           {
                              icon: "🕒",
                              title: "Time Savings",
                              content: "Save 5+ hours weekly on resume tweaks",
                           },
                           {
                              icon: "📄",
                              title: "ATS Optimization",
                              content: "97% better parsing success rate",
                           },
                           {
                              icon: "💸",
                              title: "Flexible Pricing",
                              content: "Free trial + $15/month for 100 credits",
                           },
                        ].map((item, index) => (
                           <div
                              key={index}
                              className="p-4 bg-white rounded-lg border border-gray-100 shadow-sm"
                           >
                              <div className="flex items-center gap-3 mb-2">
                                 <span className="text-2xl">{item.icon}</span>
                                 <h3 className="font-semibold text-gray-800">
                                    {item.title}
                                 </h3>
                              </div>
                              <p className="text-gray-600 text-sm">
                                 {item.content}
                              </p>
                           </div>
                        ))}
                     </div>
                  </div>
               </section>

               {/* Payment Note */}
               <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200 text-center">
                  <strong className="text-blue-800">Important Note:</strong>{" "}
                  <span className="text-blue-700">
                     During payment processing, you may see CVtoSalary's name as
                     our parent company
                  </span>
               </div>
            </div>
         </div>
      </div>
   );
};

export default About;
