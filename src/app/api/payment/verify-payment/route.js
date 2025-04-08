// src/app/api/payment/verify-payment/route.js
import { NextResponse } from "next/server";
import { verifyPayment } from "../../../../lib/payment";

export async function POST(request) {
   console.log("Verify payment endpoint called");
   try {
      const { paymentId, userId } = await request.json();
      console.log("Verify payment params:", { paymentId, userId });

      if (!paymentId || !userId) {
         console.log("Missing payment ID or user ID:", { paymentId, userId });
         return NextResponse.json(
            { error: "Payment ID and User ID are required" },
            { status: 400 }
         );
      }

      console.log(
         `Verifying payment for user ${userId} with payment ID ${paymentId}`
      );
      const isPaymentValid = await verifyPayment(paymentId);
      console.log("Payment validation result:", isPaymentValid);

      if (isPaymentValid) {
         console.log(`Payment ${paymentId} verified successfully`);
         return NextResponse.json({ success: true });
      }

      console.log(`Payment ${paymentId} verification failed`);
      return NextResponse.json(
         { error: "Payment verification failed" },
         { status: 400 }
      );
   } catch (error) {
      console.error("Payment verification error:", error.message);
      return NextResponse.json(
         { error: "Failed to verify payment", details: error.message },
         { status: 500 }
      );
   }
}
