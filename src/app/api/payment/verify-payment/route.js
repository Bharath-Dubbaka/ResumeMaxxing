import { NextResponse } from "next/server";
import { verifyPayment } from "../../../../lib/payment";

export async function POST(request) {
   try {
      const { paymentId, userId } = await request.json();

      if (!paymentId || !userId) {
         return NextResponse.json(
            { error: "Payment ID and User ID are required" },
            { status: 400 }
         );
      }

      const isPaymentValid = await verifyPayment(paymentId);

      if (isPaymentValid) {
         return NextResponse.json({ success: true });
      }

      return NextResponse.json(
         { error: "Payment verification failed" },
         { status: 400 }
      );
   } catch (error) {
      console.error("Payment verification error:", error);
      return NextResponse.json(
         { error: "Failed to verify payment" },
         { status: 500 }
      );
   }
}
