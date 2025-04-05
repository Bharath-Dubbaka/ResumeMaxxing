// app/api/payment/create-dodo-payment-link/route.js

import { createDodoPaymentLink } from "../../../../lib/dodoPayment";
import { NextResponse } from "next/server";

export async function POST(request) {
   try {
      const { userId, userEmail, userName } = await request.json();

      if (!userId) {
         return NextResponse.json(
            { error: "Missing required user information" }, 
            { status: 400 }
         );
      }

      const paymentLink = await createDodoPaymentLink(
         userId, 
         userEmail || "user@example.com", 
         userName || "User"
      );

      return NextResponse.json({ paymentLink });
   } catch (error) {
      console.error("Error creating payment link:", error);
      return NextResponse.json(
         { error: "Failed to create payment link" }, 
         { status: 500 }
      );
   }
}