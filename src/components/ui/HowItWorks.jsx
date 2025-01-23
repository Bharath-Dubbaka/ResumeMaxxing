import { FileText, Wand2, Download } from "lucide-react";

export default function HowItWorks() {
   const steps = [
      {
         icon: <FileText className="w-12 h-12 text-green-500" />,
         title: "Step 1: Analyze Job Description",
         description:
            "Paste your target job description and let our AI analyze it to extract required technical skills and experience. You can customize and map skills to specific work experiences.",
         bulletPoints: [
            "AI-powered job description analysis",
            "Extracts technical skills automatically using AI/LLMs",
            "Skill mapping functionality to link skills with specific work experiences",
            "Detects experience requirements",
            "Comparison with users total experience",
            "Minimal user interaction and information required",
         ],
      },
      {
         icon: <Wand2 className="w-12 h-12 text-blue-500" />,
         title: "Step 2: Generate Resume Content",
         description:
            "Our AI will craft a tailored professional summary and generate role-specific responsibilities that highlight your mapped skills in each work experience.",
         bulletPoints: [
            "Creates AI-generated professional summary based on Experience, Latest role, and Skills",
            "Generates Smart role-specific responsibilities using user provided mapping for skills",
            "User can choose to focus on skill-based responsibilities or title-based responsibilities",
            "Skills are intelligently distributed across experiences based on mappings",
         ],
      },
      {
         icon: <Download className="w-12 h-12 text-orange-500" />,
         title: "Step 3: Download & Apply",
         description:
            "Preview your polished resume with all sections perfectly formatted. Download it as a Word document, make any final tweaks, and you're ready to apply!",
         bulletPoints: [
            "Professional resume preview with Edit Mode for better user experience and ease of use before final customization",
            "ATS friendly Word document download and format",
            "Includes properly formatted sections with AI input in parsing user details",
            "Save the Generated responsibilities for later use by saving those to custom responsibilities in user details",
         ],
      },
   ];

   return (
      <div className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-yellow-50/95 via-pink-50 to-blue-200/60 animate-gradient-xy">
         <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">
               Here is what you need to know about how this works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {steps.map((step, index) => (
                  <div
                     key={index}
                     className="flex flex-col backdrop-blur-md bg-white border border-teal-500/10  items-center text-center space-y-4 rounded-lg shadow-lg p-7"
                  >
                     <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center">
                        {step.icon}
                     </div>
                     <h3 className="text-xl font-semibold">{step.title}</h3>
                     <p className="text-black max-w-sm">{step.description}</p>
                     <ul className="list-disc text-left text-gray-600 mt-4 pl-8">
                        {step.bulletPoints.map((point, i) => (
                           <li key={i}>{point}</li>
                        ))}
                     </ul>
                  </div>
               ))}
            </div>
         </div>
      </div>
   );
}
