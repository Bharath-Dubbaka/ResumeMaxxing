// lib/dodoPayment.js

if (!process.env.DODO_API_KEY) {
   console.error(
      "Missing Dodo API credentials. Please check your environment variables."
   );
}

export const createDodoPaymentLink = async (userId, userEmail, userName) => {
   try {
      // First, let's log more detailed information about the request
      console.log("Attempting to create Dodo payment with:", {
         apiKey: process.env.DODO_API_KEY ? "Exists (hidden)" : "Missing",
         productId: process.env.DODO_PRODUCT_ID,
         returnUrl: `${process.env.NEXT_PUBLIC_APP_PATH_URL}/dodo-payment-success?userId=${userId}`,
         userId,
         userEmail,
      });

      // The API endpoint was incorrect - Dodo uses api.dodopayments.com, not test.dodopayments.com
      const response = await fetch("https://api.dodopayments.com/v1/payments", {
         method: "POST",
         headers: {
            Authorization: `Bearer ${process.env.DODO_API_KEY}`,
            "Content-Type": "application/json",
            "Dodo-Version": "2024-04-01",
         },
         body: JSON.stringify({
            payment_link: true,
            billing: {
               city: "San Francisco",
               country: "US",
               state: "CA",
               street: "123 Main St",
               zipcode: "94105",
            },
            customer: {
               email: userEmail,
               name: userName,
               phone_number: "+14155550123", // Test number
            },
            product_cart: [
               {
                  product_id: process.env.DODO_PRODUCT_ID,
                  quantity: 1,
               },
            ],
            return_url: `${process.env.NEXT_PUBLIC_APP_PATH_URL}/dodo-payment-success?userId=${userId}`,
            metadata: {
               user_id: userId,
            },
         }),
      });

      const responseText = await response.text();
      console.log("Dodo API Response:", responseText);

      if (!response.ok) {
         console.error(`Dodo API Error [${response.status}]:`, responseText);
         throw new Error(
            `Dodo API Error [${response.status}]: ${
               responseText || "No error message"
            }`
         );
      }

      let responseData;
      try {
         responseData = JSON.parse(responseText);
      } catch (e) {
         console.error("Failed to parse response:", responseText);
         throw new Error("Invalid response from payment gateway");
      }

      if (!responseData.payment_link) {
         console.error("Payment link missing:", responseData);
         throw new Error("Payment link missing in API response");
      }

      return responseData.payment_link;
   } catch (error) {
      console.error("Payment Link Creation Failed:", {
         error: error.message,
         requestDetails: {
            endpoint: "https://api.dodopayments.com/v1/payments",
            headers: {
               Authorization: "Bearer [REDACTED]",
               "Content-Type": "application/json",
               "Dodo-Version": "2024-04-01",
            },
            body: {
               product_cart: [{ product_id: process.env.DODO_PRODUCT_ID }],
            },
         },
      });
      throw error;
   }
};

export const verifyDodoPayment = async (paymentId) => {
   try {
      if (!paymentId) {
         console.error("Missing payment ID for verification");
         return false;
      }

      // Also fix the verification endpoint
      const response = await fetch(
         `https://api.dodopayments.com/v1/payments/${paymentId}`,
         {
            method: "GET",
            headers: {
               Authorization: `Bearer ${process.env.DODO_API_KEY}`,
               "Content-Type": "application/json",
               "Dodo-Version": "2024-04-01",
            },
         }
      );

      const responseText = await response.text();
      console.log(
         `Dodo payment verification response for ${paymentId}:`,
         responseText
      );

      if (!response.ok) {
         console.error(
            `Failed to verify payment: ${response.status} - ${responseText}`
         );
         throw new Error(`Failed to verify payment: ${response.statusText}`);
      }

      const payment = JSON.parse(responseText);
      return payment.status === "completed";
   } catch (error) {
      console.error("Error verifying Dodo payment:", error);
      return false;
   }
};
