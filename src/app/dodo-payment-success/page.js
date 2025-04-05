// app/DodoPaymentSuccessPage/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

export default function DodoPaymentSuccess() {
   const router = useRouter();
   const [status, setStatus] = useState("processing");
   const { user } = useSelector((state) => state.auth);

   useEffect(() => {
      // Extract payment ID from URL query parameters
      const urlParams = new URLSearchParams(window.location.search);
      const paymentId = urlParams.get("payment_id");
      const userId = urlParams.get("userId");

      if (paymentId) {
         // Store the payment ID in localStorage for verification
         window.localStorage.setItem("dodo_payment_id", paymentId);

         // Verify the payment
         verifyPayment(userId, paymentId);
      } else {
         setStatus("error");
      }
   }, []);

   const verifyPayment = async (userId, paymentId) => {
      try {
         const response = await fetch("/api/payment/verify-dodo-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, paymentId }),
         });

         const result = await response.json();

         if (result.success) {
            setStatus("success");
            // Redirect to dashboard after 3 seconds
            setTimeout(() => {
               router.push("/dashboard");
            }, 3000);
         } else {
            setStatus("error");
         }
      } catch (error) {
         console.error("Error verifying payment:", error);
         setStatus("error");
      }
   };

   return (
      <div className="container mx-auto px-4 py-28 flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-yellow-50/95 via-pink-50 to-blue-200/60">
         <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
            <h1 className="text-2xl font-bold mb-4">
               {status === "processing" && "Processing Your Payment..."}
               {status === "success" && "Payment Successful!"}
               {status === "error" && "Payment Verification Failed"}
            </h1>

            {status === "processing" && (
               <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
               </div>
            )}

            {status === "success" && (
               <>
                  <div className="text-green-500 mb-4">
                     <svg
                        className="h-16 w-16 mx-auto"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                     >
                        <path
                           fillRule="evenodd"
                           d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                           clipRule="evenodd"
                        />
                     </svg>
                  </div>
                  <p className="mb-4">
                     Your account has been upgraded to Premium!
                  </p>
                  <p className="text-sm text-gray-500">
                     Redirecting to dashboard...
                  </p>
               </>
            )}

            {status === "error" && (
               <>
                  <div className="text-red-500 mb-4">
                     <svg
                        className="h-16 w-16 mx-auto"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                     >
                        <path
                           fillRule="evenodd"
                           d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                           clipRule="evenodd"
                        />
                     </svg>
                  </div>
                  <p className="mb-4">
                     We couldn't verify your payment. Please contact support.
                  </p>
                  <button
                     onClick={() => router.push("/dashboard")}
                     className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                     Go to Dashboard
                  </button>
               </>
            )}
         </div>
      </div>
   );
}
