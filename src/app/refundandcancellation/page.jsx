import React from "react";

const RefundAndCancellation = () => {
   return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50/95 via-pink-50 to-blue-200/60 animate-gradient-xy">
         <div className="py-20 md:py-28 max-w-4xl mx-4 md:mx-auto">
            <h1 className="text-2xl font-bold mb-4">Refund and Cancellation</h1>

            <div className="mb-2 pb-2">
               <p>
                  ResumeOnFly (prod by CVtoSalary), Cancellations will be
                  considered only if the request is made within the same day of
                  placing the order. However, the cancellation request may not
                  be entertained if the orders have been communicated to the
                  vendors/merchants and they have initiated the process of
                  shipping them.
               </p>
            </div>

            <div className="mb-2 pb-2">
               <p>
                  Refunds will not be granted under the following conditions:
                  <ul className="list-disc ml-6 mt-2">
                     <li>
                        If you change your mind after purchasing a subscription
                        or service.
                     </li>
                     <li>
                        If you fail to use the service during the subscription
                        period.
                     </li>
                     <li>
                        If the issue is caused by third-party software or tools
                        not affiliated with our platform.
                     </li>
                  </ul>
               </p>
            </div>

            <div className="mb-2 pb-2">
               <p>
                  Refunds may be considered under the following conditions:
                  <ul className="list-disc ml-6 mt-2">
                     <li>
                        If the service is not delivered as promised due to an
                        error on our end.
                     </li>
                     <li>
                        If a technical issue caused by our platform prevents you
                        from accessing the features you paid for, and the issue
                        cannot be resolved within a reasonable timeframe.
                     </li>
                     <li>
                        If you cancel your subscription within the refund period
                        outlined below.
                     </li>
                  </ul>
               </p>
            </div>

            <div className="mb-2 pb-2">
               <p>
                  Refund requests must be made within{" "}
                  <strong>8 days of the payment date</strong>. Requests made
                  after this period will not be eligible for a refund.
               </p>
            </div>

            <div className="mb-2 pb-2">
               <p>
                  In case you feel that the product/service received is not as
                  per your expectations, you must bring it to the notice of our
                  customer service within the same day of receiving the product.
                  The Customer Service Team, after looking into your complaint,
                  will take an appropriate decision.
               </p>
            </div>

            <div className="mb-2 pb-2">
               <p>
                  To request a refund, please follow these steps:
                  <ol className="list-decimal ml-6 mt-2">
                     <li>
                        Contact our support team at{" "}
                        <a
                           href="mailto:resumeonfly@gmail.com"
                           className="text-blue-700 underline"
                        >
                           resumeonfly@gmail.com
                        </a>
                        .
                     </li>
                     <li>
                        Provide your payment receipt, order ID, and a detailed
                        explanation of the issue.
                     </li>
                     <li>
                        Our team will review your request and respond within 3-5
                        business days.
                     </li>
                     <li>
                        If your request is approved, the refund will be
                        processed to your original payment method within 7-10
                        business days.
                     </li>
                  </ol>
               </p>
            </div>

            <div className="mb-2 pb-2">
               <p>
                  In case of any refunds approved by ResumeOnFly, it'll take 6-8
                  days for the refund to be processed to the end customer.
               </p>
            </div>

            <div className="mb-2 pb-2">
               <p>
                  If you have any questions about this Refund Policy or require
                  assistance, please reach out to us at{" "}
                  <a
                     href="mailto:resumeonfly@gmail.com"
                     className="text-blue-700 underline"
                  >
                     resumeonfly@gmail.com
                  </a>
                  .
               </p>
            </div>

            <div className="mb-2 pb-2 text-sm text-gray-500">
               <p>Last updated: 01/01/2025</p>
            </div>
         </div>
      </div>
   );
};

export default RefundAndCancellation;
