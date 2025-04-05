import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req) {
   try {
      const { userEmail, userName } = await req.json();

      // Mandatory billing fields based on Dodo API requirements
      const billingDetails = {
         currency: "USD",
         country: "US", // Required field from error message
         city: "New York", // Add other required fields
         state: "NY",
         street: "123 Main St",
         zipcode: "10001",
      };

      const dodoResponse = await axios.post(
         "https://test.dodopayments.com/payments",
         {
            billing: billingDetails,
            customer: {
               email: userEmail,
               name: userName,
            },
            product_cart: [
               {
                  product_id: process.env.DODO_PRODUCT_ID,
                  quantity: 1,
               },
            ],
            payment_link: true,
            return_url: `${process.env.NEXT_PUBLIC_APP_PATH_URL}/dashboard`,
         },
         {
            headers: {
               Authorization: `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
               "Content-Type": "application/json",
            },
         }
      );

      return NextResponse.json({
         paymentLink: dodoResponse.data.payment_link,
      });
   } catch (error) {
      console.error("Full Error:", error.response?.data || error.message);
      return NextResponse.json(
         {
            error: "Payment failed: " + (error.response?.data || error.message),
         },
         { status: 500 }
      );
   }
}
