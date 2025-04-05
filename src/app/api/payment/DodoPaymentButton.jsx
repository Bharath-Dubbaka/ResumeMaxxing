"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Loader2 } from "lucide-react";

export function DodoPaymentButton({ userId, userEmail, userName, onSuccess }) {
   const [loading, setLoading] = useState(false);

   const handleUpgradeClick = async () => {
      setLoading(true);
      try {
         // Get payment link
         const response = await fetch("/api/payment/create-dodo-payment-link", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               userId,
               userEmail,
               userName,
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
                  "/api/payment/verify-dodo-payment",
                  {
                     method: "POST",
                     headers: { "Content-Type": "application/json" },
                     body: JSON.stringify({
                        userId,
                        paymentId:
                           window.localStorage.getItem("dodo_payment_id"),
                     }),
                  }
               );

               const { success } = await verifyResponse.json();
               if (success) {
                  clearInterval(checkPaymentStatus);
                  if (onSuccess) await onSuccess();
                  setLoading(false);
               }
            } catch (error) {
               console.error("Error checking payment status:", error);
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
         className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
      >
         {loading ? (
            <>
               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
               Processing...
            </>
         ) : (
            "Pay with USD ($6.90)"
         )}
      </Button>
   );
}
