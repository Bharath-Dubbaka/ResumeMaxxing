// app/api/payment/verify-dodo-payment/route.js

import { verifyDodoPayment } from "../../../../lib/dodoPayment";
import { NextResponse } from "next/server";
import { QuotaService } from "../../../../services/QuotaService";

export async function POST(request) {
   try {
      const { paymentId, userId } = await request.json();

      if (!paymentId || !userId) {
         return NextResponse.json(
            { error: "Missing payment ID or user ID" },
            { status: 400 }
         );
      }

      const isVerified = await verifyDodoPayment(paymentId);

      if (isVerified) {
         // Upgrade user to premium
         await QuotaService.upgradeToPremium(userId);
         return NextResponse.json({ success: true });
      } else {
         return NextResponse.json(
            { success: false, error: "Payment verification failed" },
            { status: 400 }
         );
      }
   } catch (error) {
      console.error("Error verifying payment:", error);
      return NextResponse.json(
         { success: false, error: "Server error" },
         { status: 500 }
      );
   }
}
