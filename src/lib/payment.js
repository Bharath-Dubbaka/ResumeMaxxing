// lib/payment.js
import Razorpay from "razorpay";
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
   console.error(
      "Missing Razorpay credentials. Please check your environment variables."
   );
}
const razorpay = new Razorpay({
   key_id: process.env.RAZORPAY_KEY_ID || "",
   key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});
export const createPaymentLink = async (
   userId,
   userEmail,
   userName,
   currency
) => {
   const priceMap = {
      INR: 69900, // ₹699
      USD: 899, // $8.99
   };
   const amount = priceMap[currency] || priceMap["INR"]; // Fallback to INR
   try {
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
         throw new Error("Razorpay credentials are not configured");
      }
      const paymentLinkRequest = {
         amount: amount, //  in paise
         currency: currency,
         accept_partial: false,
         description:
            "Upgrade to One Month Premium - ResumeOnFly.com (prod of CVtoSalary)",
         customer: {
            name: userName,
            email: userEmail,
         },
         notify: {
            sms: true,
            email: true,
         },
         reminder_enable: true,
         notes: {
            userId: userId,
         },
         callback_url: `${process.env.NEXT_PUBLIC_APP_PATH_URL}/payment-success`,
         callback_method: "get",
      };
      const paymentLink = await razorpay.paymentLink.create(paymentLinkRequest);
      return paymentLink.short_url;
   } catch (error) {
      console.error("Error creating payment link:", error);
      throw error;
   }
};
export const verifyPayment = async (paymentId) => {
   try {
      if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
         throw new Error("Razorpay credentials are not configured");
      }
      const payment = await razorpay.payments.fetch(paymentId);
      return payment.status === "captured";
   } catch (error) {
      console.error("Error verifying payment:", error);
      return false;
   }
};
