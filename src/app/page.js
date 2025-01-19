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

         if (user) {
            if (userDetails) {
               router.push("/dashboard");
            } else {
               router.push("/userForm");
            }
            return;
         }

         const provider = new GoogleAuthProvider();
         const result = await signInWithPopup(auth, provider);

         // Update Redux store with user data
         dispatch(
            setUser({
               email: result.user.email,
               name: result.user.displayName,
               picture: result.user.photoURL,
               uid: result.user.uid,
            })
         );

         // Initialize quota and update Redux store
         const quota = await QuotaService.getUserQuota(result.user.uid);
         dispatch(setUserQuota(quota));

         // Get user details and update Redux store
         const details = await UserDetailsService.getUserDetails(
            result.user.uid
         );
         dispatch(setUserDetails(details));

         if (details) {
            router.push("/dashboard");
         } else {
            router.push("/userForm");
         }
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
         <div className="">
            {/* Hero Section */}
            <div className="min-h-screen text-center space-y-8 pt-40 bg-gradient-to-br from-purple-200/60 via-pink-50 to-blue-200/60 animate-gradient-xy">
               <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-pink-900">
                  AI-Powered Resume Builder
               </h1>
               <p className="text-slate-900 text-xl md:text-2xl max-w-2xl mx-auto">
                  Create professional resumes in minutes with our advanced AI
                  technology. Stand out from the crowd and land your dream job.
               </p>
               <div className="space-x-4">
                  <Button
                     size="lg"
                     className="bg-purple-600 hover:bg-purple-700"
                     onClick={handleGetStarted}
                  >
                     Get Started
                  </Button>
                  <Button size="lg" variant="outline">
                     View Examples
                  </Button>
               </div>
               {/* Features Section */}
               <div className="grid md:grid-cols-3 gap-8 pt-10 mb-10 px-20">
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
            <VideoSection />
         </div>
      </div>
   );
}
