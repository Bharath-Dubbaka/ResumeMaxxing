import {
   Save,
   BrainCircuit,
   Network,
   ListChecks,
   FileText,
   LayoutTemplate,
   Edit3,
   GitBranch,
   FileBox,
} from "lucide-react";

export default function Whyus() {
   const features = [
      {
         title: "Master Resume Storage",
         description:
            "Central hub for all your professional details & versions",
         icon: <Save className="w-10 h-16 text-emerald-600" />,
      },
      {
         title: "AI Job Analysis",
         description: "Smart parsing of job descriptions & requirements",
         icon: <BrainCircuit className="w-10 h-16 text-blue-600" />,
      },
      {
         title: "Skill Mapping",
         description: "Visual linking of skills to specific experiences",
         icon: <Network className="w-10 h-16 text-purple-600" />,
      },
      {
         title: "Custom Responsibilities",
         description: "Save & reuse tailored position descriptions",
         icon: <ListChecks className="w-10 h-16 text-amber-600" />,
      },

      {
         title: "Template Selection",
         description: "Multiple industry-specific professional designs",
         icon: <LayoutTemplate className="w-10 h-16 text-pink-600" />,
      },
      {
         title: "ATS-Optimized Formats",
         description:
            "Recruiter-approved structures that pass tracking systems",
         icon: <FileText className="w-10 h-16 text-green-600" />,
      },
      {
         title: "Live Edit Mode",
         description: "Real-time editing with instant preview",
         icon: <Edit3 className="w-10 h-16 text-red-600" />,
      },
      {
         title: "Version Tracking",
         description: "Manage multiple tailored resume versions",
         icon: <GitBranch className="w-10 h-16 text-indigo-600" />,
      },
      {
         title: "Word/PDF Export",
         description: "Flawless formatting in preferred formats",
         icon: <FileBox className="w-10 h-16 text-cyan-600" />,
      },
      {
         title: "Experience Comparison",
         description: "AI-powered gap analysis for target roles",
         icon: <ListChecks className="w-10 h-16 text-orange-600" />,
      },
   ];

   return (
      <section className="py-16 px-4 sm:px-6 lg:px-28 bg-gradient-to-br from-yellow-50/95  to-pink-100/80 animate-gradient-xy">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-6">
               <h2 className="text-4xl font-bold text-center mb-2 underline">
                  Why Choose Our Resume Builder?
               </h2>
               <p className="text-xl text-gray-600 mb-4">
                  Key Differentiators That Make Us Unique
               </p>
               <p className="text-gray-500 max-w-2xl mx-auto">
                  Transform your job search with AI-powered precision,
                  industry-proven templates, and smart automation that puts you
                  ahead of the competition.
               </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {features.map((feature, index) => (
                  <div
                     key={index}
                     className="bg-white p-4 rounded-lg shadow-xl hover:shadow-md duration-300 hover:-translate-y-1.5 transition-transform"
                  >
                     <div className="flex items-start gap-3 py-1 my-2">
                        <span className="p-2 rounded-lg bg-gradient-to-br from-blue-300/40 to-pink-300/40 animate-gradient-xy">
                           {feature.icon}
                        </span>
                        <div>
                           <h3 className="text-lg font-semibold mb-2">
                              {feature.title}
                           </h3>
                           <p className="text-gray-600 text-sm">
                              {feature.description}
                           </p>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>
   );
}
