"use client";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";

const content = [
   {
      title: "STEP 1: Centralized Master Profile",
      description: [
         "🚀 :Securely store core professional details: contact information, employment history, education",
         "🚀 :Create reusable skill sets adaptable to different roles and industries and link skills with specific work experiences",
         "🚀 :Toggle between skill-focused or title-based responsibility generation and experience presentation",
         "🚀 :Save custom competencies for quick reuse across multiple resume versions and future re-edits",
      ].join("\n"),
      content: (
         <div className="h-full w-full flex items-center justify-center text-black">
            <Image
               src="/slides/slideDemoOne.png"
               width={900}
               height={900}
               className="h-full w-full object-fill"
               alt="AI 1 visualization"
            />
         </div>
      ),
   },
   {
      title: "STEP 2: Smart Job Description Analysis",
      description: [
         "🚀 :AI-powered parsing extracts key requirements and technical competencies from job-descriptions",
         "🚀 :Automatic identification of required skills and experience levels by top-notch AI/LLM integration",
         "🚀 :Smart matching with your existing profile data",
         "🚀 :Customizable skill-to-experience mapping interface provided as the tool completes the analyzing",
      ].join("\n"),
      content: (
         <div className="h-full w-full flex items-center justify-center text-black">
            <Image
               src="/slides/slideDemoTwo.png"
               width={900}
               height={900}
               className="h-full w-full object-fill"
               alt="AI 2 visualization"
            />
         </div>
      ),
   },
   {
      title: "STEP 3: AI-Optimized Resume Generation",
      description: [
         "🚀 :Automated creation of targeted professional summaries based on provided Master info and job description",
         "🚀 :Dynamic generation of role-specific or title-based responsibilities",
         "🚀 :Intelligent distribution of competencies across experience sections",
         "🚀 :Preview and edit resumes with real-time formatting",
      ].join("\n"),
      content: (
         <div className="h-full w-full flex items-center justify-center text-black">
            <Image
               src="/slides/slideDemoThree.png"
               width={900}
               height={900}
               className="h-full w-full object-fill"
               alt="AI 3 visualization"
            />
         </div>
      ),
   },
   {
      title: "STEP 4: Professional Export & Templates",
      description: [
         "🚀 :Download as ATS-friendly Word documents",
         "🚀 :Save AI-generated content to master profile",
         "🚀 :Multiple industry-specific professional templates",
      ].join("\n"),
      content: (
         <div className="h-full w-full flex items-center justify-center text-black">
            <Image
               src="/slides/slideDemoFour.png"
               width={900}
               height={900}
               className="h-full w-full object-fill"
               alt="AI analysis4 visualization"
            />
         </div>
      ),
   },
];

export function StickyScrollRevealDemo() {
   return (
      <div className="backdrop-blur-md bg-gradient-to-br from-purple-200/60 to-yellow-50/95 animate-gradient-xy pt-16">
         <div className="text-center mb-2">
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
         <StickyScroll content={content} />
      </div>
   );
}

export const StickyScroll = ({ content, contentClassName }) => {
   const [activeCard, setActiveCard] = React.useState(0);
   const ref = useRef(null);
   const { scrollYProgress } = useScroll({
      // uncomment line 22 and comment line 23 if you DONT want the overflow container and want to have it change on the entire page scroll
      // target: ref
      container: ref,
      offset: ["start start", "end start"],
   });
   const cardLength = content.length;

   useMotionValueEvent(scrollYProgress, "change", (latest) => {
      const cardsBreakpoints = content.map((_, index) => index / cardLength);
      const closestBreakpointIndex = cardsBreakpoints.reduce(
         (acc, breakpoint, index) => {
            const distance = Math.abs(latest - breakpoint);
            if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
               return index;
            }
            return acc;
         },
         0
      );
      setActiveCard(closestBreakpointIndex);
   });

   const backgroundColors = [
      "var(--slate-900)",
      "var(--black)",
      "var(--neutral-900)",
   ];
   const linearGradients = [
      "linear-gradient(to bottom right, var(--cyan-500), var(--emerald-500))",
      "linear-gradient(to bottom right, var(--pink-500), var(--indigo-500))",
      "linear-gradient(to bottom right, var(--orange-500), var(--yellow-500))",
   ];

   const [backgroundGradient, setBackgroundGradient] = useState(
      linearGradients[0]
   );

   useEffect(() => {
      setBackgroundGradient(
         linearGradients[activeCard % linearGradients.length]
      );
   }, [activeCard]);

   return (
      <motion.div
         className="h-[40rem] overflow-y-auto flex  justify-center relative space-x-4 w-full rounded-md "
         ref={ref}
      >
         <div className="div relative flex items-start px-6 lg:px-2 lg:w-[38%]">
            <div className="max-w-4xl px-4 md:px-0">
               {content.map((item, index) => (
                  <div key={item.title + index} className="my-10 md:my-20">
                     <motion.h2
                        initial={{
                           opacity: 0,
                        }}
                        animate={{
                           opacity: activeCard === index ? 1 : 0.3,
                        }}
                        className="text-2xl font-extrabold text-teal-900 underline"
                     >
                        {item.title}
                     </motion.h2>
                     <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: activeCard === index ? 1 : 0.3 }}
                        className="text-lg text-slate-800 w-full mt-10 whitespace-pre-line"
                     >
                        {item.description}
                     </motion.p>
                  </div>
               ))}
               <div className="h-10" />
            </div>
         </div>
         <div
            style={{ background: backgroundGradient }}
            className={cn(
               "hidden lg:block mt-28 lg:h-[24rem] border border-slate-400 w-[50%] rounded-md bg-white sticky top-10 overflow-hidden",
               contentClassName
            )}
         >
            {content[activeCard].content ?? null}
         </div>
      </motion.div>
   );
};
