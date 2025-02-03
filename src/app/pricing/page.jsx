"use client";
import React, { useState } from "react";
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
   const dispatch = useDispatch();
   const { user } = useSelector((state) => state.auth);

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
         return;
      }

      setIsLoading(true);
      try {
         const response = await fetch("/api/payment/create-payment-link", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               userId: user.uid,
               userEmail: user.email,
               userName: user.name,
            }),
         });

         const { paymentLink } = await response.json();
         if (!paymentLink) throw new Error("Failed to create payment link");

         // Open payment in new window
         window.open(paymentLink, "_blank");

         // Start polling for payment status
         const checkPaymentStatus = setInterval(async () => {
            try {
               const verifyResponse = await fetch(
                  "/api/payment/verify-payment",
                  {
                     method: "POST",
                     headers: { "Content-Type": "application/json" },
                     body: JSON.stringify({
                        userId: user.uid,
                        paymentId: window.localStorage.getItem(
                           "razorpay_payment_id"
                        ),
                     }),
                  }
               );

               const data = await verifyResponse.json();
               if (data.success) {
                  clearInterval(checkPaymentStatus);
                  // Refresh quota data
                  const quota = await QuotaService.getUserQuota(user.uid);
                  dispatch(setUserQuota(quota));
                  router.push("/dashboard");
               }
            } catch (error) {
               console.error("Error verifying payment:", error);
            }
         }, 2000);

         // Stop checking after 5 minutes
         setTimeout(() => {
            clearInterval(checkPaymentStatus);
            setIsLoading(false);
         }, 300000);
      } catch (error) {
         console.error("Error initiating payment:", error);
         setIsLoading(false);
      }
   };

   return (
      <div className="container mx-auto px-4 py-28 bg-gradient-to-br from-yellow-50/95 via-pink-50 to-blue-200/60 animate-gradient-xy">
         <Toaster
            position="top-center"
            toastOptions={{
               style: {
                  background: "#FFB3B3",
               },
               className: "class",
            }}
         />
         <h2 className="text-4xl font-bold text-center mb-8 text-gray-900">
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
               <p className="text-5xl font-extrabold text-indigo-600 mb-2">
                  ₹499
                  <span className="text-4xl font-bold text-indigo-600 mb-2">
                     /month
                  </span>
               </p>
               <div className="flex items-center space-x-2 mb-2">
                  <p className="text-xl text-gray-400 line-through">₹999</p>
                  {/* <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                     ₹300 OFF
                  </span> */}
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
               <button
                  onClick={handleUpgradeNow}
                  className="px-6 py-3 rounded-lg text-white font-semibold bg-indigo-600 hover:bg-indigo-700 transition-all duration-200"
                  disabled={setUserQuota?.subscription?.type === "premium"}
               >
                  Upgrade Now
               </button>
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
