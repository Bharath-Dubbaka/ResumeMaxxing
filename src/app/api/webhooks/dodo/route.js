// File: /app/api/webhooks/dodo/route.js
import { NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { db } from "../../../../services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { QuotaService } from "../../../../services/QuotaService";

export async function POST(request) {
  try {
    const webhookSecret = process.env.DODO_WEBHOOK_SECRET_KEY;
    const webhook = new Webhook(webhookSecret);
    
    const rawBody = await request.text();
    const headers = request.headers;
    
    const webhookHeaders = {
      "webhook-id": headers.get("webhook-id") || "",
      "webhook-signature": headers.get("webhook-signature") || "",
      "webhook-timestamp": headers.get("webhook-timestamp") || "",
    };

    // Verify webhook signature
    await webhook.verify(rawBody, webhookHeaders);
    
    // Parse the payload
    const payload = JSON.parse(rawBody);
    
    // Handle different webhook events
    if (payload.type === "payment.succeeded") {
      const paymentId = payload.data.payment_id;
      const metadata = payload.data.metadata || {};
      const userId = metadata.userId;
      
      if (!userId) {
        console.error("Missing userId in payment metadata");
        return NextResponse.json({ received: true });
      }
      
      // Update payment status in Firestore
      const paymentDocRef = doc(db, "payments", `dodo_${paymentId}`);
      const paymentDoc = await getDoc(paymentDocRef);
      
      if (paymentDoc.exists()) {
        await updateDoc(paymentDocRef, {
          status: "succeeded",
          updatedAt: new Date().toISOString()
        });
      } else {
        // If payment record doesn't exist (might happen if created through dashboard)
        // Create a new payment record
        const paymentData = {
          userId,
          paymentId,
          provider: "dodo",
          amount: payload.data.amount / 100, // Convert from cents
          currency: payload.data.currency,
          status: "succeeded",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await doc(db, "payments", `dodo_${paymentId}`).set(paymentData);
      }
      
      // Upgrade user quota
      await QuotaService.upgradeToPremium(userId);
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 400 });
  }
}