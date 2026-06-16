// app/pricing/page.jsx
// User is on /pricing page and initiates payment
// Payment link is created successfully (POST /api/payment/create-payment-link 200)
// User completes payment and gets redirected to /payment-success with Razorpay parameters
// Two successful payment verifications occur:
// First: Payment pay_QGImOE3MGMHLeu verified successfully (200 response)
// Second: Payment pay_QGImOE3MGMHLeu verified successfully (200 response)
// User is redirected to /dashboard

"use client";
import React, { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { auth } from "../../services/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { QuotaService } from "../../services/QuotaService";
import { UserDetailsService } from "../../services/UserDetailsService";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../../store/slices/authSlice";
import { setUserDetails, setUserQuota } from "../../store/slices/firebaseSlice";
import { toast, Toaster } from "sonner";
import { motion } from "motion/react";


const Pricing = () => {
  const router = useRouter();
  const { userDetails, userQuota } = useSelector((state) => state.firebase);
  const [isLoading, setIsLoading] = useState(false);
  const [showInternational, setShowInternational] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [countryCode, setCountryCode] = useState(null);

  //CORS issue so enable extension in development
  const getUserCountry = async () => {
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
      return data.country_code; // 'IN' for India
    } catch (error) {
      console.error("Error detecting country:", error);
      return null;
    }
  };

  useEffect(() => {
    const detectCountry = async () => {
      const country = await getUserCountry();
      setCountryCode(country);
    };
    detectCountry();
  }, []);

  const isIndia = countryCode === "IN";
  const price = isIndia ? "149" : "$1.99";
  const currency = isIndia ? "INR" : "USD";

  const handleGetStarted = async () => {
    try {
      setIsLoading(true);
      if (user) {
        if (userDetails) {
          router.push("/");
        } else {
          router.push("/");
        }
        return;
      }
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      dispatch(
        setUser({
          email: result.user.email,
          name: result.user.displayName,
          picture: result.user.photoURL,
          uid: result.user.uid,
        }),
      );
      const quota = await QuotaService.getUserQuota(result.user.uid);
      dispatch(setUserQuota(quota));
      const details = await UserDetailsService.getUserDetails(result.user.uid);
      dispatch(setUserDetails(details));
      if (details) {
        router.push("/");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgradeNow = async () => {
    if (!user) {
      await handleGetStarted();
      return;
    }
    if (userQuota?.subscription?.type === "premium") {
      toast.error("Already in premium mode");
      console.log("Already in premium mode");
      alert("Already in premium mode");
      return;
    }
    setIsLoading(true);

    try {
      // Clear any previous payment data to avoid confusion
      window.localStorage.removeItem("razorpay_payment_id");
      window.localStorage.removeItem("payment_verified");

      console.log("Creating payment link for", user.uid);
      const response = await fetch("/api/payment/create-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
          userName: user.name,
          currency: currency,
        }),
      });

      const { paymentLink } = await response.json();
      console.log("Payment link created:", paymentLink);

      if (!paymentLink) throw new Error("Failed to create payment link");

      // For PayPal/international payments, use same window to avoid auth issues
      // The key difference is:
      // INR transactions: Open in new window/tab, original app window maintains state and polls
      // USD transactions: Direct redirect in same window, authentication state must be recovered after redirect to solve Paypal err
      //read:::https://claude.ai/chat/87ebb9f5-6946-42fb-8056-7315530aded7
      if (currency !== "INR") {
        window.location.href = paymentLink;
        return; // Exit early as we're redirecting away
      } else {
        // For INR payments, open in new window and poll
        window.open(paymentLink, "_blank");
      }

      // Start polling for payment status
      console.log("Starting payment verification polling");
      const checkPaymentStatus = setInterval(async () => {
        try {
          // First check if payment was already verified in success page
          if (window.localStorage.getItem("payment_verified") === "true") {
            console.log("Payment already verified in success page");
            clearInterval(checkPaymentStatus);
            window.localStorage.removeItem("payment_verified");
            window.localStorage.removeItem("razorpay_payment_id");

            // Refresh quota data and redirect
            const quota = await QuotaService.getUserQuota(user.uid);
            dispatch(setUserQuota(quota));
            router.push("/");
            return;
          }

          // Check if we have a payment ID in localStorage
          const paymentId = window.localStorage.getItem("razorpay_payment_id");

          // If no payment ID yet, just wait for the next poll
          if (!paymentId) {
            console.log("No payment ID found yet, waiting...");
            return;
          }

          console.log("Verifying payment ID from pricing page:", paymentId);

          const verifyResponse = await fetch("/api/payment/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.uid,
              paymentId: paymentId,
            }),
          });

          if (!verifyResponse.ok) {
            console.error(
              `Verification response not OK: ${verifyResponse.status}`,
            );
            const errorText = await verifyResponse.text();
            console.error(`Error details: ${errorText}`);
            return;
          }

          const data = await verifyResponse.json();
          console.log("Verification response:", data);

          if (data.success) {
            console.log("Payment verified successfully!");
            clearInterval(checkPaymentStatus);
            window.localStorage.removeItem("razorpay_payment_id");
            const quota = await QuotaService.getUserQuota(user.uid);
            dispatch(setUserQuota(quota));
            router.push("/");
          } else {
            console.log("Payment not verified yet", data);
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
        }
      }, 2000);

      // Stop checking after 5 minutes
      setTimeout(() => {
        console.log("Payment polling timeout reached (5 minutes)");
        clearInterval(checkPaymentStatus);
        setIsLoading(false);
      }, 300000);
    } catch (error) {
      console.error("Error initiating payment:", error);
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.5 }}
      className="px-4 sm:px-6 lg:px-12 py-16 bg-gradient-to-br from-indigo-50/50 via-white to-pink-50/50 min-h-[70vh] flex flex-col justify-center"
    >
      <div className="max-w-6xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-mono font-bold tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase">
            Pricing Plans
          </span>
          <h2 className="text-3xl sm:text-4xl font-sans font-bold text-slate-900 tracking-tight mt-3">
            Choose Your Plan
          </h2>
          <p className="text-slate-500 font-sans text-sm sm:text-base mt-2">
            Start free and upgrade to unlock unlimited ATS analyses, custom
            bullet-point tailoring, and pristine resume exports.
          </p>
        </div>

        {/* Pricing Layout Container - Sleek 3 Column Grid */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch max-w-5xl mx-auto">
          {/* Freemium Plan */}
          <div className="bg-white border border-slate-200/80 p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Level 1
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                Freemium
              </h3>
              <div className="mt-4 mb-4">
                <span className="text-3xl font-bold text-slate-900">Free</span>
                <span className="text-xs text-slate-400 font-mono block mt-1">
                  10 credits included
                </span>
              </div>
              <ul className="text-slate-600 text-xs sm:text-sm space-y-2.5 my-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>10 Job Description Analyses</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>10 Resume Customizations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>10 Standard Exports</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleGetStarted}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-semibold transition-colors mt-4 cursor-pointer"
            >
              Get Started Free
            </button>
          </div>

          {/* Premium Plan - Highlighted */}
          <div className="bg-white border-2 border-indigo-600 relative p-6 sm:p-8 rounded-2xl shadow-md hover:shadow-lg transition-all flex flex-col justify-between scale-[1.02] md:scale-[1.03] z-10">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] sm:text-xs font-mono font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
              Most Popular
            </span>
            <div>
              <span className="text-[10px] font-mono font-bold text-indigo-500 uppercase tracking-wider">
                Level 2
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">Premium</h3>
              <div className="mt-4 mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-sans">
                    {price}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    /Month
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-slate-400 line-through">
                    {isIndia ? "₹499" : "$6.99"}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    Save over 70%
                  </span>
                </div>
              </div>
              <ul className="text-slate-600 text-xs sm:text-sm space-y-2.5 my-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>
                    <strong>100</strong> Job Description Analyses
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>
                    <strong>100</strong> High-Fidelity Customizations
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>
                    <strong>100</strong> High-speed Downloads
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Priority Server Pipeline Processing</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleUpgradeNow}
              disabled={
                isLoading || userQuota?.subscription?.type === "premium"
              }
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition-colors mt-4 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-md shadow-indigo-100 cursor-pointer"
            >
              {isLoading
                ? "Setting Up Payment..."
                : userQuota?.subscription?.type === "premium"
                  ? "Already Premium"
                  : `Upgrade for ${price}`}
            </button>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white border border-slate-200/80 p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Level 3
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                Enterprise
              </h3>
              <div className="mt-4 mb-4">
                <span className="text-3xl font-bold text-slate-900">
                  Custom
                </span>
                <span className="text-xs text-slate-400 font-mono block mt-1">
                  Tailored for agency users
                </span>
              </div>
              <ul className="text-slate-600 text-xs sm:text-sm space-y-2.5 my-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Unlimited Custom Profiles</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Multi-seat Team Collaboration Logs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>Custom API & Whitelabel Layouts</span>
                </li>
              </ul>
            </div>

            <a
              href="mailto:contact@cvtosalary.com?subject=Enterprise Inquiry - ResumeOnFly"
              className="w-full py-2.5 px-4 rounded-xl border border-slate-900 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold text-center transition-colors mt-4 block"
            >
              Contact Support
            </a>
          </div>
        </div>

        {/* Corporate parent citation note */}
        <div className="mt-12 text-center max-w-md mx-auto space-y-2">
          <p className="text-xs text-slate-400 leading-relaxed font-mono">
            💡 Payments are securely processed via CVtoSalary parent routing.
            You can request a 100% immediate backup refund anytime.
          </p>
        </div>
      </div>
    </motion.div>
  );
};
export default Pricing;
