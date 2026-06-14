// app/page.js

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

        <Newlayout />
        {/* <DashboardPage/> */}
        {/* <VideoSection /> */}
        {/* <HowItWorks /> */}
        <Whyus />
        {/* <ProblemsWeSolve /> */}
        {/* <StickyScrollRevealDemo /> */}

        <HowWeSolve />
      </div>
    </div>
  );
}
