"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { Loader2 } from "lucide-react";
import { QuotaService } from "../../services/QuotaService";
import { setUserQuota } from "../../store/slices/firebaseSlice";
import { doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../services/firebase";

export default function DodoSuccessPage() {
   const router = useRouter();
   const dispatch = useDispatch();
   const { user } = useSelector((state) => state.auth);
   const [status, setStatus] = useState("Verifying payment...");
   const [error, setError] = useState(null);

   useEffect(() => {
      if (!user) {
         setStatus("User not logged in. Redirecting...");
         setTimeout(() => router.push("/"), 2000);
         return;
      }

      const params = new URLSearchParams(window.location.search);
      const paymentId = params.get("payment_id");
      const paymentStatus = params.get("status");

      if (!paymentId) {
         setStatus("No payment information found. Redirecting...");
         setTimeout(() => router.push("/dashboard"), 2000);
         return;
      }

      // Store the payment ID for later verification attempts
      localStorage.setItem("dodo_payment_id", paymentId);
      console.log(
         `Processing payment ${paymentId} with status ${paymentStatus} for user ${user.uid}`
      );

      const verifyAndUpdateUser = async () => {
         try {
            // First try to verify payment with our backend
            setStatus("Contacting payment server...");
            const verifyResponse = await fetch("/api/dodo/verify-payment", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({
                  paymentId,
                  userId: user.uid,
               }),
            });

            // Parse response, handle non-JSON errors
            let data;
            try {
               data = await verifyResponse.json();
            } catch (parseError) {
               console.error(
                  "Error parsing verification response:",
                  parseError
               );
               setError(
                  "Server returned an invalid response. Please contact support."
               );

               // If status is explicitly "succeeded", proceed anyway
               if (paymentStatus !== "succeeded") {
                  return; // Exit if we can't parse response and status isn't successful
               }
            }

            // If API verification succeeded
            if (data?.success) {
               setStatus("Payment verified! Updating your account...");

               // Refresh quota from database
               try {
                  const quota = await QuotaService.getUserQuota(user.uid);
                  dispatch(setUserQuota(quota));

                  // Clear payment ID from localStorage
                  localStorage.removeItem("dodo_payment_id");

                  setStatus("Success! Redirecting to dashboard...");
                  setTimeout(() => router.push("/dashboard"), 3000);
                  return;
               } catch (quotaError) {
                  console.error("Error fetching updated quota:", quotaError);
                  // Continue with backup plan
               }
            }

            // If API verification failed but Dodo reports success or we have status=succeeded in URL
            if (paymentStatus === "succeeded") {
               setStatus(
                  "Payment successful! Updating your account directly..."
               );

               // Check if quota document exists
               const quotaRef = doc(db, "quotas", user.uid);
               const quotaSnap = await getDoc(quotaRef);

               try {
                  // Use setDoc with merge if doc doesn't exist, otherwise updateDoc
                  if (!quotaSnap.exists()) {
                     await setDoc(
                        quotaRef,
                        {
                           downloads: { limit: 100, used: 0 },
                           generates: { limit: 100, used: 0 },
                           parsing: { limit: 100, used: 0 },
                           subscription: {
                              type: "premium",
                              startDate: new Date().toISOString(),
                              endDate: new Date(
                                 Date.now() + 30 * 24 * 60 * 60 * 1000
                              ).toISOString(),
                           },
                        },
                        { merge: true }
                     );
                  } else {
                     await updateDoc(quotaRef, {
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
                  }

                  // Clear payment ID
                  localStorage.removeItem("dodo_payment_id");

                  // Update Redux state
                  const quota = await QuotaService.getUserQuota(user.uid);
                  dispatch(setUserQuota(quota));

                  setStatus("Success! Redirecting to dashboard...");
                  setTimeout(() => router.push("/dashboard"), 3000);
               } catch (updateError) {
                  console.error("Error updating user data:", updateError);
                  setError(
                     "Payment processed but account update failed. Please contact support."
                  );
                  setTimeout(() => router.push("/dashboard"), 5000);
               }
            } else {
               console.error(
                  "Payment verification failed:",
                  data?.error || "Unknown error"
               );
               setError(
                  `Payment verification failed. Status: ${
                     paymentStatus || "unknown"
                  }. Please contact support.`
               );
               setTimeout(() => router.push("/dashboard"), 5000);
            }
         } catch (error) {
            console.error("Error in payment verification process:", error);
            setError(
               "Verification error. Please contact support with reference: " +
                  paymentId
            );
            setTimeout(() => router.push("/dashboard"), 5000);
         }
      };

      verifyAndUpdateUser();
   }, [user, router, dispatch]);

   return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200/60 via-pink-50/95 to-blue-200/60">
         <div className="text-center space-y-4 p-8 bg-white rounded-xl shadow-lg max-w-md w-full">
            {error ? (
               <>
                  <h1 className="text-3xl font-bold text-orange-600">
                     Payment Processing
                  </h1>
                  <p className="text-gray-700">{error}</p>
                  <p className="text-sm text-gray-500">
                     You will be redirected to dashboard shortly...
                  </p>
                  <div className="flex justify-center mt-4">
                     <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                  </div>
               </>
            ) : (
               <>
                  <div className="flex justify-center mb-4">
                     <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
                  </div>
                  <h1 className="text-3xl font-bold text-green-600">
                     Payment Successful!
                  </h1>
                  <p className="text-gray-600">
                     Thank you for upgrading to Premium.
                  </p>
                  <p className="text-sm text-gray-500">{status}</p>
               </>
            )}
         </div>
      </div>
   );
}
