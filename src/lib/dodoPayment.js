// lib/dodoPayment.js

if (!process.env.DODO_API_KEY) {
    console.error(
       "Missing Dodo API credentials. Please check your environment variables."
    );
 }
 
 export const createDodoPaymentLink = async (userId, userEmail, userName) => {
    try {
       if (!process.env.DODO_API_KEY) {
          throw new Error("Dodo Payment credentials are not configured");
       }
 
       const response = await fetch('https://api.dodo.com/v1/payment-links', {
          method: 'POST',
          headers: {
             'Authorization': `Bearer ${process.env.DODO_API_KEY}`,
             'Content-Type': 'application/json'
          },
          body: JSON.stringify({
             amount: 6.90, // $6.90 in USD
             currency: "USD",
             description: "Premium Subscription - ResumeOnFly.com",
             customer: {
                name: userName,
                email: userEmail,
             },
             metadata: {
                userId: userId,
             },
             success_url: `${process.env.NEXT_PUBLIC_APP_PATH_URL}/dodo-payment-success?userId=${userId}`,
             cancel_url: `${process.env.NEXT_PUBLIC_APP_PATH_URL}/pricing`,
          })
       });
 
       if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Dodo API error: ${errorData.message || response.statusText}`);
       }
 
       const data = await response.json();
       return data.payment_url;
    } catch (error) {
       console.error("Error creating Dodo payment link:", error);
       throw error;
    }
 };
 
 export const verifyDodoPayment = async (paymentId) => {
    try {
       if (!process.env.DODO_API_KEY) {
          throw new Error("Dodo Payment credentials are not configured");
       }
 
       const response = await fetch(`https://api.dodo.com/v1/payments/${paymentId}`, {
          method: 'GET',
          headers: {
             'Authorization': `Bearer ${process.env.DODO_API_KEY}`,
             'Content-Type': 'application/json'
          }
       });
 
       if (!response.ok) {
          throw new Error(`Failed to verify payment: ${response.statusText}`);
       }
 
       const payment = await response.json();
       return payment.status === "completed" || payment.status === "succeeded";
    } catch (error) {
       console.error("Error verifying Dodo payment:", error);
       return false;
    }
 };