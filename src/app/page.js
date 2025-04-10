"use client";
import { Button } from "../components/ui/button";
import FeatureCard from "../components/ui/FeaturedCard";
import VideoSection from "../components/ui/VideoSection";
import Link from "next/link";
import { auth } from "../services/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { QuotaService } from "../services/QuotaService";
import { UserDetailsService } from "../services/UserDetailsService";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../store/slices/authSlice";
import { setUserDetails, setUserQuota } from "../store/slices/firebaseSlice";
import { useState } from "react";
import { Spinner } from "../components/ui/spinner";
import { useEffect } from "react";
import HowItWorks from "../components/ui/HowItWorks";
import ProblemsWeSolve from "../components/ui/ProblemsWeSolve";
import HowWeSolve from "../components/ui/HowWeSolve";
import TypeWriting from "../components/ui/TypeWriting";
import AuthService from "../services/AuthService";
import { StickyScrollRevealDemo } from "../components/aceternityUI/StickyScrollRevealDemo";
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
            <div className="min-h-screen relative z-10 text-center space-y-8 pt-40 bg-gradient-to-br from-yellow-50/90  to-purple-200/60 animate-gradient-xy">
               <TypeWriting />
               <p className="text-slate-800  font-light text-xl md:text-2xl max-w-2xl mx-auto">
                  <span className="font-bold">Create/Customize</span> your
                  professional resumes with our cutting-edge{" "}
                  <span className="font-bold">
                     AI technology in just minutes
                  </span>{" "}
                  as per Job Description, to{" "}
                  <span className="font-bold"> 10x your speed</span> and{" "}
                  <span className="font-bold">10x your chances</span> to land
                  your dream job.
               </p>
               <div className="space-x-4">
                  <Button
                     size="lg"
                     className="bg-gradient-to-br from-purple-600  to-indigo-500  hover:from-indigo-500 hover:to-purple-500"
                     onClick={handleGetStarted}
                  >
                     Get Started
                  </Button>
                  <Button size="lg" variant="outline" className="hidden">
                     View Examples
                  </Button>
               </div>
               {/* Features Section */}
               <div className="grid md:grid-cols-3 gap-8 pt-10 pb-20 mb-10 px-4 md:px-20 ">
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
               </div>
            </div>
            <StickyScrollRevealDemo />
            {/* <VideoSection /> */}
            {/* <HowItWorks /> */}
            <Whyus />
            <ProblemsWeSolve />
            <HowWeSolve />
         </div>
      </div>
   );
}
