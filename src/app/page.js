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
import DashboardPage from "./dashboard/page";
import Newlayout from "../components/Newlayout";
import {
  Sparkles,
  Video,
  ArrowRight,
  CheckCircle,
  Shield,
  Menu,
  X,
  Laptop,
  User,
  BrainCircuit,
  Github,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { userDetails } = useSelector((state) => state.firebase);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      const unsubscribe = QuotaService.listenToUserQuota(user.uid, (quota) => {
        dispatch(setUserQuota(quota)); // Dispatch action to update quota in Redux store
      });

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
      document
        .getElementById("resume-builder")
        ?.scrollIntoView({ behavior: "smooth" });
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
    <div className="min-h-screen bg-[#fafbfc] text-slate-800 selection:bg-indigo-100 selection:text-indigo-900 font-sans">
      {/* Premium Sticky Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 sm:px-12 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-950 flex items-center justify-center text-white font-display font-bold">
              R
            </div>
            <span className="font-display font-medium text-slate-900 tracking-tight text-base sm:text-lg">
              ResumeTailor
            </span>
            <span className="text-[10px] bg-indigo-50 text-indigo-600 font-mono font-black rounded-full px-2 py-0.5">
              AI-V3
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a
              href="#problems-section"
              className="text-slate-500 hover:text-slate-900 transition-colors"
            >
              Problems
            </a>
            <a
              href="#how-it-works"
              className="text-slate-500 hover:text-slate-900 transition-colors"
            >
              How it works
            </a>
            <a
              href="#why-us"
              className="text-slate-500 hover:text-slate-900 transition-colors"
            >
              Advantages
            </a>
            <a
              href="#resume-builder"
              className="text-slate-500 hover:text-slate-900 transition-colors"
            >
              Workspace
            </a>
          </nav>

          <div className="flex items-center gap-4">
            {/* Display Active Quota Meter */}
            {/* <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200/50 rounded-full px-3 py-1 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-500">Free Quota:</span>
              <strong className="text-slate-900">{quota} remaining</strong>
            </div> */}

            <button
              onClick={handleGetStarted}
              className="px-4 py-2 rounded-full bg-slate-900 hover:bg-indigo-600 font-semibold text-white text-xs sm:text-sm shadow-sm transition-all duration-300"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16 text-center max-w-5xl mx-auto px-6 space-y-6">
        {/* Dynamic TypeWriter Title Banner */}
        <div className="min-h-36 sm:min-h-max flex justify-center items-center">
          <TypeWriting />
        </div>

        <p className="text-slate-600 font-sans text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Built for busy job seekers — upload your master resume once, and
          customize it for every job description in a few clicks.
        </p>

        {/* Floating gradient CTA link */}
        <div className="flex justify-center pt-2">
          <div className="rounded-full bg-gradient-to-r from-emerald-400 via-indigo-500 to-purple-500 p-[1.5px] shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all">
            <button
              onClick={handleGetStarted}
              className="text-white hover:text-slate-900 bg-slate-950 hover:bg-white font-semibold text-xs sm:text-sm rounded-full px-6 py-3.5 transition-all flex items-center gap-2"
            >
              <span>Instant Setup & Start Building</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>
      </section>

      <Newlayout />

      {/* Video Demonstration Embedded Showcase */}
      <section className="py-12 px-6 sm:px-12 lg:px-24">
        <div className="max-w-5xl mx-auto bg-white border border-slate-200/80 rounded-2xl shadow-md p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row justify-between items-center gap-8">
          {/* Custom HD Video Embed Frame */}
          <div className="w-full lg:w-3/5 aspect-video overflow-hidden rounded-xl shadow-lg border border-slate-100 hover:scale-[1.01] transition-transform duration-300 relative bg-slate-950">
            <iframe
              className="absolute inset-0 w-full h-full"
              src="https://www.youtube.com/embed/zRR9SISA7sw?&vq=hd1080&modestbranding=1&rel=0&autoplay=0&mute=1"
              title="How to Build Your AI Resume"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              playsInline
            />
          </div>

          {/* Context Explainer text panel */}
          <div className="w-full lg:w-2/5 text-start space-y-4">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              <Video className="w-3.5 h-3.5 shrink-0" />
              <span>Interactive Walkthrough</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-sans font-bold text-slate-900 leading-tight">
              Synchronize your value proposition with the target role, instantly
            </h3>

            <ul className="space-y-3 pt-2">
              <li className="flex gap-2.5 text-xs sm:text-sm text-slate-600 align-top">
                <span className="text-indigo-500 text-base leading-none">
                  🔸
                </span>
                <span>
                  Tired of updates? Let our AI restructure and tailor bullet
                  points in under 30 seconds for free.
                </span>
              </li>
              <li className="flex gap-2.5 text-xs sm:text-sm text-slate-600 align-top">
                <span className="text-indigo-500 text-base leading-none">
                  🔸
                </span>
                <span>
                  Powered by Gemini 3.5 Flash, it understands hiring criteria
                  and automatically emphasizes relevant skills organically.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* <DashboardPage/> */}
      {/* <VideoSection /> */}
      {/* <HowItWorks /> */}
      <Whyus />
      {/* <ProblemsWeSolve /> */}
      {/* <StickyScrollRevealDemo /> */}

      <HowWeSolve />
      {/* Shared Footer Panel */}
      <footer className="py-12 border-t border-slate-100 bg-white px-6 sm:px-12 text-center text-slate-400 text-xs font-mono space-y-3">
        <div className="flex justify-center items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {/* <span className="text-slate-600 font-bold">
            Secure Cloud Sandbox Node Active
          </span> */}
        </div>
        <p className="max-w-md mx-auto leading-normal">
          This customized tool integrates standard parsed resume guidelines.
          Upload records safely for optimal interview matching.
        </p>
        <p className="text-[10px] text-slate-300">
          © {new Date().getFullYear()} ResumeTailor Inc. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
