import React from "react";

const RefundAndCancellation = () => {
   return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50/95 via-pink-50 to-blue-200/60 animate-gradient-xy">
         <div className="py-20 md:py-28 max-w-4xl mx-4 md:mx-auto  ">
            <h1 className="text-2xl font-bold mb-4">
               {" "}
               Refund and Cancellation
            </h1>
            <div className="mb-2 pb-2">
               <p>
                  Cancellations will be considered only if the request is made
                  within same day of placing the order. However, the
                  cancellation request may not be entertained if the orders have
                  been communicated to the vendors/merchants and they have
                  initiated the process of shipping them.
               </p>
            </div>

            <div className="mb-2 pb-2">
               <p>
                  <strong>Since ResumeOnFly is a product of CVtoSalary,</strong>{" "}
                  all payment transactions will be processed through CVtoSalary.
                  This is why CVtoSalary.com name may appear on your payment
                  confirmation or related documentation.
               </p>
            </div>
            <div className="mb-2 pb-2">
               {" "}
               <p>
                  CVtoSalary does not accept cancellation requests for
                  perishable items like flowers, eatables etc. However,
                  refund/replacement can be made if the customer establishes
                  that the quality of product/service delivered is not good (up
                  to 50% of whole amount paid).
               </p>
            </div>
            <div className="mb-2 pb-2">
               {" "}
               <p>
                  In case of case of such please report the same to our Customer
                  Service team. The request will, however, be entertained once
                  the merchant has checked and determined the same at his own
                  end. This should be reported within same day of receipt of the
                  product/service.
               </p>
            </div>
            <div className="mb-2 pb-2">
               {" "}
               <p>
                  In case you feel that the product/service received is not as
                  per your expectations, you must bring it to the notice of our
                  customer service within same day of receiving the product. The
                  Customer Service Team after looking into your complaint will
                  take an appropriate decision. In case of any Refunds approved
                  by the CVtoSalary, it'll take 6-8 days for the refund to be
                  processed to the end customer
               </p>
            </div>
         </div>
      </div>
   );
};

export default RefundAndCancellation;
