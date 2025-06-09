"use client";

import { QuotaService } from "../services/QuotaService";
import { UserDetailsService } from "../services/UserDetailsService";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../store/slices/authSlice";
import { setUserDetails, setUserQuota } from "../store/slices/firebaseSlice";
import { useState } from "react";
import { Spinner } from "../components/ui/spinner";
import { useEffect } from "react";
import ProblemsWeSolve from "../components/ui/ProblemsWeSolve";
import HowWeSolve from "../components/ui/HowWeSolve";
import TypeWriting from "../components/ui/TypeWriting";
import AuthService from "../services/AuthService";
import Whyus from "../components/ui/Whyus";

export default function Home() {
   const router = useRouter();
   const { userDetails } = useSelector((state) => state.firebase);
   const [isLoading, setIsLoading] = useState(false);
   const dispatch = useDispatch();
   const { user } = useSelector((state) => state.auth);

   
   useEffect(() => {
      if (user) {
         const unsubscribe = QuotaService.listenToUserQuota(
            user.uid,
            (quota) => {
               dispatch(setUserQuota(quota)); // Dispatch action to update quota in Redux store
            }
         );

         // Cleanup the listener on unmount
         return () => unsubscribe();
      }
   }, [user, dispatch]);

   const handleGetStarted = async () => {
      try {
         setIsLoading(true);
         await AuthService.handleAuthFlow(dispatch, router, user, userDetails, {
            setUser,
            setUserQuota,
            setUserDetails,
         });
      } catch (error) {
         console.error("Login error:", error);
      } finally {
         setIsLoading(false);
      }
   };

   if (isLoading) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200/60 via-pink-50 to-blue-200/60">
            <div className="text-center space-y-4">
               <Spinner className="w-12 h-12 border-4 text-purple-600" />
               <p className="text-gray-600 font-medium">
                  Setting up your account...
               </p>
            </div>
         </div>
      );
   }

   return (
      <div className="">
         <div>
            {/* Hero Section */}
            <div className="min-h-screen relative z-10 text-center space-y-8 pt-32 lg:pt-48 bg-gradient-to-br from-pink-100/70  to-yellow-50/80   animate-gradient-xy animate-gradient-xy">
               <div className="min-h-36 sm:min-h-max">
                  <TypeWriting />
               </div>
               <p className="text-slate-800  font-light text-xl md:text-2xl max-w-4xl mx-auto px-4">
                  <span className="underline text-2xl md:text-3xl">
                     Built for busy job seekers — upload your master resume
                     once, and customize it for every job in a few clicks
                  </span>
               </p>
               <div className="space-x-2 flex justify-center align-middle items-center">
                  <div className="sm:w-1/2 md:w-1/3 lg:w-1/4  rounded-full bg-gradient-to-r from-teal-500 via-orange-600 to-purple-500 p-[2px] animate-shine">
                     {" "}
                     <button
                        size="lg"
                        className="w-full px-6 py-4 text-lg font-semibold text-white shadow-xl rounded-full bg-gradient-to-r from-purple-700 via-pink-800 to-purple-700 p-[2px] animate-shine transition-all duration-300"
                        onClick={handleGetStarted}
                     >
                        Get Started
                     </button>
                     {/* <Button size="lg" variant="outline" className="hidden">
                     View Examples
                  </Button> */}
                  </div>
               </div>
               {/* Features Section */}
               {/* <div className="grid md:grid-cols-3 gap-8 pt-10 pb-20 mb-10 px-4 md:px-20 ">
                  <FeatureCard
                     title="AI-Powered Writing"
                     description="Our AI analyzes your experience and generates professional descriptions that highlight your achievements."
                  />
                  <FeatureCard
                     title="ATS-Friendly Templates"
                     description="Professionally designed templates that are optimized for Applicant Tracking Systems."
                  />
                  <FeatureCard
                     title="Real-Time Editing"
                     description="Edit and preview your resume in real-time with our intuitive interface."
                  />
               </div> */}
               <div>
                  {/* <div className="text-center mb-2 pt-8">
                     <h2 className="text-4xl font-bold text-center mb-2 underline">
                        How this works !
                     </h2>
                     <p className="text-xl text-gray-600 mb-4">
                        Our streamlined four-step process transforms your resume
                        creation
                     </p>
                     <p className="text-gray-500 max-w-[80%] mx-auto">
                        <span className="font-bold">
                           {" "}
                           Centralized Master Profile
                        </span>
                        ,
                        <span className="hidden sm:inline">
                           securely storing your professional details and
                           reusable skills, eliminating repetitive entries.{" "}
                        </span>
                        <span className="font-bold">
                           Smart Job Description Analysis
                        </span>{" "}
                        <span className="hidden sm:inline">
                           uses AI to extract key requirements and match them to
                           profile, ensuring your resume is tailored to each
                           opportunity.
                        </span>
                        <span className="font-bold">
                           AI-Optimized Resume Generation
                        </span>{" "}
                        <span className="hidden sm:inline">
                           automatically creates targeted summaries and dynamic
                           responsibilities, saving you hours of manual work.{" "}
                        </span>
                        <span className="font-bold">
                           Finally, Professional Export & Templates{" "}
                        </span>
                        <span className="hidden sm:inline">
                           provide ATS-friendly formats, allowing you to present
                           a polished, impactful resume every time."
                        </span>
                     </p>
                  </div> */}
                  <section className="flex flex-col lg:flex-row  justify-between  px-4 py-8 lg:px-16 lg:pb-24 rounded-lg ">
                     {/* Video Embed */}
                     <div className="w-full lg:w-3/5 aspect-video mb-6 md:mb-0 shadow-2xl">
                        <iframe
                           className="w-full h-full rounded-md"
                           src="https://www.youtube.com/embed/zRR9SISA7sw?&vq=hd1080&modestbranding=1&rel=0&autoplay=1&mute=1"
                           title="How to Build Your AI Resume"
                           frameBorder="0"
                           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                           allowFullScreen
                           // Optional: Add these for mobile optimization
                           playsInline
                           muted={1}
                        ></iframe>
                     </div>

                     {/* Content Section */}
                     <div className="w-full pt-4 lg:pt-0 lg:w-2/5 flex flex-col items-start lg:pl-6 text-start">
                        <h2 className="text-2xl md:text-2xl font-bold text-gray-800 mb-6">
                           {/* See what our AI resume builder can do ???  */}
                           Update your resume according to Job description in
                           Minutes
                        </h2>
                        <p className="text-gray-600 text-lg mb-4 flex">
                           <p>🔸</p>
                           Tired of updating resume for each and every Job
                           Description ??? let our AI do that in just Minutes
                           for FREE !!!
                        </p>
                        <p className="text-gray-600 text-lg flex">
                           <p>🔸</p>
                           Artificial intelligence has made it possible for us
                           to automate the process of creating and tailoring a
                           resume to the job description in just minutes, making
                           it nearly effortless and faster than before..
                        </p>
                     </div>
                  </section>
               </div>
            </div>
            {/* <VideoSection /> */}
            {/* <HowItWorks /> */}
            <Whyus />
            <ProblemsWeSolve />
            {/* <StickyScrollRevealDemo /> */}

            <HowWeSolve />
         </div>
      </div>
   );
}
