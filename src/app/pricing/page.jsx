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
   const price = isIndia ? "₹699" : "$8.99";
   const currency = isIndia ? "INR" : "USD";

   const handleGetStarted = async () => {
      try {
         setIsLoading(true);
         if (user) {
            if (userDetails) {
               router.push("/dashboard");
            } else {
               router.push("/userFormPage");
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
            })
         );
         const quota = await QuotaService.getUserQuota(result.user.uid);
         dispatch(setUserQuota(quota));
         const details = await UserDetailsService.getUserDetails(
            result.user.uid
         );
         dispatch(setUserDetails(details));
         if (details) {
            router.push("/dashboard");
         } else {
            router.push("/userFormPage");
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
                  router.push("/dashboard");
                  return;
               }

               // Check if we have a payment ID in localStorage
               const paymentId = window.localStorage.getItem(
                  "razorpay_payment_id"
               );

               // If no payment ID yet, just wait for the next poll
               if (!paymentId) {
                  console.log("No payment ID found yet, waiting...");
                  return;
               }

               console.log(
                  "Verifying payment ID from pricing page:",
                  paymentId
               );

               const verifyResponse = await fetch(
                  "/api/payment/verify-payment",
                  {
                     method: "POST",
                     headers: { "Content-Type": "application/json" },
                     body: JSON.stringify({
                        userId: user.uid,
                        paymentId: paymentId,
                     }),
                  }
               );

               if (!verifyResponse.ok) {
                  console.error(
                     `Verification response not OK: ${verifyResponse.status}`
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
                  router.push("/dashboard");
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
      <div className="px-4 lg:px-10 py-28 bg-gradient-to-br from-yellow-50/95 via-pink-50 to-blue-200/60 animate-gradient-xy">
         <Toaster
            position="top-center"
            toastOptions={{
               style: {
                  background: "#FFB3B3",
               },
               className: "class",
            }}
         />
         <h2 className="text-4xl font-bold text-center mb-8 text-gray-900 underline">
            Choose Your Plan
         </h2>
         <p className="text-center text-gray-600 mb-12">
            Start free and upgrade as you grow. Pick a plan that suits your
            needs.
         </p>
         <div className="grid md:grid-cols-3 gap-8">
            {/* Freemium Plan */}
            <div className="relative flex flex-col items-center bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
               <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Freemium
               </h3>
               <p className="text-4xl font-bold text-indigo-600 mb-2">Free</p>
               <p className="text-sm text-gray-500 mb-6">10 Credits</p>
               <ul className="text-gray-700 mb-6 space-y-2">
                  <li className="flex items-center">
                     <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                     10 Job Description Analyses
                  </li>
                  <li className="flex items-center">
                     <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                     10 Resume Generations
                  </li>
                  <li className="flex items-center">
                     <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                     10 Downloads
                  </li>
               </ul>
               <button
                  onClick={handleGetStarted}
                  className="px-6 py-3 rounded-lg text-white font-semibold bg-gray-800 hover:bg-gray-900 transition-all duration-200"
               >
                  Get Started
               </button>
            </div>
            {/* Premium Plan */}
            <div className="relative flex flex-col items-center bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-4 border-purple-600">
               <div className="absolute top-4 right-4 bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded">
                  Most Popular
               </div>
               <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Premium
               </h3>
               <p className=" text-4xl lg:text-5xl font-extrabold text-indigo-600 mb-2">
                  {price}
                  <span className="text-3xl lg:text-4xl font-bold text-indigo-600 mb-2">
                     /month
                  </span>
               </p>
               <div className="flex items-center space-x-2 mb-2">
                  <p className="text-xl text-gray-400 line-through">
                     {isIndia ? "(₹1299rs)" : "($12.99 USD)"}
                  </p>
               </div>
               <p className="text-sm text-gray-500 mb-6">100 Credits</p>
               <ul className="text-gray-700 mb-6 space-y-2">
                  <li className="flex items-center">
                     <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                     100 Job Description Analyses
                  </li>
                  <li className="flex items-center">
                     <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                     100 Resume Generations
                  </li>
                  <li className="flex items-center">
                     <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                     100 Downloads
                  </li>
               </ul>
               {/* Payment Buttons */}
               <div className="space-y-4 w-full">
                  <button
                     onClick={handleUpgradeNow}
                     className="w-full px-6 py-3 rounded-lg text-white font-semibold bg-indigo-600 hover:bg-indigo-700 transition-all duration-200"
                     disabled={userQuota?.subscription?.type === "premium"}
                  >
                     {isIndia ? "Pay (₹699rs)" : "PayPal ($8.99 USD)"}
                  </button>
               </div>
            </div>
            {/* Enterprise Plan */}
            <div className="relative flex flex-col items-center bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
               <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Enterprise
               </h3>
               <p className="text-4xl font-bold text-indigo-600 mb-2">Custom</p>
               <p className="text-sm text-gray-500 mb-6">Contact Us</p>
               <ul className="text-gray-700 mb-6 space-y-2">
                  <li className="flex items-center">
                     <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                     Custom Job Description Analyses
                  </li>
                  <li className="flex items-center">
                     <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                     Custom Resume Generations
                  </li>
                  <li className="flex items-center">
                     <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                     Custom Downloads
                  </li>
               </ul>
               <a
                  href="/contact"
                  className="px-6 py-3 rounded-lg text-white font-semibold bg-gray-800 hover:bg-gray-900 transition-all duration-200"
               >
                  Contact Us
               </a>
            </div>
         </div>
         <div className="mt-12 text-center">
            <p className="text-gray-600">
               Need a custom solution?{" "}
               <a
                  href="/contact"
                  className="text-indigo-600 font-medium hover:underline"
               >
                  Contact us
               </a>{" "}
               for Enterprise plans.
            </p>
         </div>
      </div>
   );
};
export default Pricing;
