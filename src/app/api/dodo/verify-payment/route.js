import { NextResponse } from "next/server";
import { QuotaService } from "../../../../services/QuotaService";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../../services/firebase";

export async function POST(req) {
   try {
      const { paymentId, userId } = await req.json();

      if (!paymentId || !userId) {
         return NextResponse.json(
            { error: "Missing paymentId or userId" },
            { status: 400 }
         );
      }

      console.log(`Verifying payment ${paymentId} for user ${userId}`);

      // Verify payment with Dodo API
      const apiKey = process.env.DODO_PAYMENTS_API_KEY;
      if (!apiKey) {
         console.error("Missing Dodo API key in environment variables");
         return NextResponse.json(
            { error: "Server configuration error" },
            { status: 500 }
         );
      }

      console.log(`Making request to Dodo API for payment ${paymentId}`);
      const paymentRes = await fetch(
         `https://test.dodopayments.com/api/v1/payments/${paymentId}`,
         {
            method: "GET",
            headers: {
               Authorization: `Bearer ${apiKey}`,
               "Content-Type": "application/json",
            },
         }
      );

      if (!paymentRes.ok) {
         const errorText = await paymentRes.text();
         console.error(`Dodo API Error for payment ${paymentId}:`, errorText);
         return NextResponse.json(
            {
               error: "Payment verification failed",
               details: errorText,
               status: paymentRes.status,
            },
            { status: paymentRes.status }
         );
      }

      const payment = await paymentRes.json();
      console.log(`Payment status for ${paymentId}:`, payment.status);

      // If payment status is successful, upgrade user ---- doing from success page 
      // if (payment.status === "succeeded") {
      //    console.log(
      //       `Payment ${paymentId} verified as successful, upgrading user ${userId}`
      //    );

      //    try {
      //       // Update Firestore directly
      //       const userRef = doc(db, "quotas", userId);
      //       await updateDoc(userRef, {
      //          "downloads.limit": 100,
      //          "downloads.used": 0,
      //          "generates.limit": 100,
      //          "generates.used": 0,
      //          "parsing.limit": 100,
      //          "parsing.used": 0,
      //          "subscription.type": "premium",
      //          "subscription.startDate": new Date().toISOString(),
      //          "subscription.endDate": new Date(
      //             Date.now() + 30 * 24 * 60 * 60 * 1000
      //          ).toISOString(),
      //       });

      //       console.log(
      //          `User ${userId} upgraded to premium via API verification`
      //       );
      //       return NextResponse.json({
      //          success: true,
      //          message: "Payment verified and user upgraded to premium",
      //       });
      //    } catch (updateError) {
      //       console.error(
      //          `Error updating Firestore for user ${userId}:`,
      //          updateError
      //       );
      //       return NextResponse.json(
      //          {
      //             error: "Database update failed",
      //             message: updateError.message,
      //          },
      //          { status: 500 }
      //       );
      //    }
      // }

      return NextResponse.json(
         { error: "Payment not completed", status: payment.status },
         { status: 400 }
      );
   } catch (error) {
      console.error("Verification error:", error);
      return NextResponse.json(
         { error: "Internal server error", message: error.message },
         { status: 500 }
      );
   }
}
