// app/api/payment/create-payment-link/route.js
import { NextResponse } from "next/server";
import { createPaymentLink } from "../../../../lib/payment";
export async function POST(request) {
   try {
      const { userId, userEmail, userName, currency } = await request.json();
      if (!userId || !userEmail || !userName) {
         return NextResponse.json(
            { error: "User details are required" },
            { status: 400 }
         );
      }
      const paymentLink = await createPaymentLink(
         userId,
         userEmail,
         userName,
         currency
      );
      return NextResponse.json({ paymentLink });
   } catch (error) {
      console.error("Payment link creation error:", error);
      return NextResponse.json(
         { error: "Failed to create payment link" },
         { status: 500 }
      );
   }
}
