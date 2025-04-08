// src/app/payment-success/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { Loader2 } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../services/firebase";
import { QuotaService } from "../../services/QuotaService";
import { setUserQuota } from "../../store/slices/firebaseSlice";
import { setUser } from "../../store/slices/authSlice"; // Import this

export default function PaymentSuccessPage() {
   const router = useRouter();
   const dispatch = useDispatch();
   const { user } = useSelector((state) => state.auth);
   const [isProcessing, setIsProcessing] = useState(true);
   const [message, setMessage] = useState("Verifying payment...");

   useEffect(() => {
      console.log("Payment success page loaded");

      // First, check if we have auth state
      const checkAuthAndProcessPayment = async () => {
         // Get payment parameters from URL
         const searchParams = new URLSearchParams(window.location.search);
         const paymentId = searchParams.get("razorpay_payment_id");
         console.log("Payment ID from URL:", paymentId);

         if (!paymentId) {
            setMessage("No payment information found. Redirecting...");
            setTimeout(() => router.push("/pricing"), 3000);
            return;
         }

         // Store payment ID for polling from pricing page
         window.localStorage.setItem("razorpay_payment_id", paymentId);

         // Check if user is logged in
         if (!user) {
            console.log("No user in Redux state, checking Firebase auth");

            // Wait for Firebase auth state
            const unsubscribe = auth.onAuthStateChanged(
               async (firebaseUser) => {
                  if (firebaseUser) {
                     console.log("Firebase user found:", firebaseUser.uid);

                     // Set user in Redux
                     dispatch(
                        setUser({
                           email: firebaseUser.email,
                           name: firebaseUser.displayName,
                           picture: firebaseUser.photoURL,
                           uid: firebaseUser.uid,
                        })
                     );

                     // Now process the payment
                     await processPayment(paymentId, firebaseUser.uid);
                  } else {
                     console.log("No user found in Firebase auth either");
                     setMessage(
                        "Please log in to complete your payment process"
                     );
                     setTimeout(() => router.push("/pricing"), 3000);
                  }
                  unsubscribe();
               }
            );
         } else {
            // User already in Redux state
            await processPayment(paymentId, user.uid);
         }
      };

      const processPayment = async (paymentId, userId) => {
         try {
            console.log("Processing payment:", paymentId, "for user:", userId);

            // Verify the payment
            const verifyResponse = await fetch("/api/payment/verify-payment", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({
                  paymentId: paymentId,
                  userId: userId,
               }),
            });

            const data = await verifyResponse.json();
            console.log("Payment verification response:", data);

            if (data.success) {
               // Set flag for pricing page
               window.localStorage.setItem("payment_verified", "true");
               setMessage("Payment successful! Updating your subscription...");

               try {
                  // Update Firestore
                  const userRef = doc(db, "quotas", userId);
                  await updateDoc(userRef, {
                     "downloads.limit": 100,
                     "downloads.used": 0,
                     "generates.limit": 100,
                     "generates.used": 0,
                     "parsing.limit": 100,
                     "parsing.used": 0,
                     "subscription.type": "premium",
                     "subscription.startDate": new Date().toISOString(),
                     "subscription.endDate": new Date(
                        Date.now() + 30 * 24 * 60 * 60 * 1000
                     ).toISOString(),
                  });

                  // Update Redux state
                  const quota = await QuotaService.getUserQuota(userId);
                  dispatch(setUserQuota(quota));

                  setMessage("Payment successful! Redirecting to dashboard...");
                  setTimeout(() => {
                     router.push("/dashboard");
                  }, 2000);
               } catch (updateError) {
                  console.error("Error updating user data:", updateError);
                  setMessage("Subscription activated! Redirecting...");
                  setTimeout(() => router.push("/dashboard"), 2000);
               }
            } else {
               console.error("Payment verification failed:", data.error);
               setMessage(
                  "Payment verification failed. Please contact support."
               );
               setTimeout(() => router.push("/pricing"), 3000);
            }
         } catch (error) {
            console.error("Error processing payment:", error);
            setMessage("Error processing payment. Please contact support.");
            setTimeout(() => router.push("/pricing"), 3000);
         } finally {
            setIsProcessing(false);
         }
      };

      checkAuthAndProcessPayment();
   }, [router, dispatch]);

   return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200/60 via-pink-50/95 to-blue-200/60">
         <div className="text-center space-y-4">
            <div className="flex justify-center mb-4">
               {isProcessing && (
                  <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
               )}
            </div>
            <h1 className="text-3xl font-bold text-green-600">
               Payment Processing
            </h1>
            <p className="text-gray-600">{message}</p>
         </div>
      </div>
   );
}
