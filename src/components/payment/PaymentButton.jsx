// components/payment/PaymentButton.jsx


"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Loader2 } from "lucide-react";

export function PaymentButton({ userId, onSuccess }) {
   const [loading, setLoading] = useState(false);

   const handleUpgradeClick = async () => {
      setLoading(true);
      try {
         // Get payment link
         const response = await fetch("/api/payment/create-payment-link", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId }),
         });

         const { paymentLink } = await response.json();
         if (!paymentLink) throw new Error("Failed to create payment link");

         // Open payment in new window
         window.open(paymentLink, "_blank");

         // Start polling for payment status
         const checkPaymentStatus = setInterval(async () => {
            const verifyResponse = await fetch("/api/payment/verify-payment", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ userId }),
            });

            const { success } = await verifyResponse.json();
            if (success) {
               clearInterval(checkPaymentStatus);
               await onSuccess();
               setLoading(false);
            }
         }, 2000);

         // Stop checking after 5 minutes
         setTimeout(() => {
            clearInterval(checkPaymentStatus);
            setLoading(false);
         }, 300000);
      } catch (error) {
         console.error("Error initiating payment:", error);
         setLoading(false);
      }
   };

   return (
      <Button
         onClick={handleUpgradeClick}
         disabled={loading}
         className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
      >
         {loading ? (
            <>
               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
               Processing...
            </>
         ) : (
            "Upgrade to Premium"
         )}
      </Button>
   );
}
