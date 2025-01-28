import React from "react";

const TermsAndConditions = () => {
   return (
      <div className="bg-gradient-to-br from-yellow-50/95 via-pink-50 to-blue-200/60 animate-gradient-xy">
         <div className="py-28 max-w-4xl mx-auto ">
            <h1 className="text-2xl font-bold mb-4">Terms and Conditions</h1>
            <p>
               These Terms and Conditions ("Terms") govern your access to and
               use of the ResumeOnFly website and services (the "Services")
               provided by [Your Company Name] ("we," "us," or "our"). By
               accessing or using the Services, you agree to be bound by these
               Terms and our Privacy Policy. If you do not agree with these
               Terms and our Privacy Policy, please do not access or use the
               Services.
            </p>
            {/* Add sections */}
            <ol className="list-decimal pl-5 mt-4 space-y-4">
               <li>
                  <strong>Use of Services:</strong>
                  <ul className="list-disc pl-5 mt-2 space-y-2">
                     <li>
                        You must be at least 18 years old to use the Services.
                     </li>
                     <li>
                        You agree to use the Services only for lawful purposes
                        and in accordance with these Terms.
                     </li>
                     <li>
                        You are responsible for maintaining the confidentiality
                        of your account credentials.
                     </li>
                     <li>
                        You agree not to:
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                           <li>
                              Use the Services in any way that violates
                              applicable laws or regulations.
                           </li>
                           <li>
                              Impersonate any person or entity or misrepresent
                              your affiliation with a person or entity.
                           </li>
                           <li>
                              Interfere with or disrupt the Services or servers
                              or networks connected to the Services.
                           </li>
                           <li>
                              Attempt to gain unauthorized access to any part of
                              the Services.
                           </li>
                           <li>
                              Use any robot, spider, or other automated means to
                              access the Services.
                           </li>
                           <li>
                              Reverse engineer or attempt to extract the source
                              code of the Services.
                           </li>
                        </ul>
                     </li>
                     <li>
                        We reserve the right to modify or discontinue the
                        Services at any time without notice.
                     </li>
                  </ul>
               </li>
               <li>
                  <strong>AI-Powered Content:</strong>
                  <p>
                     The Services utilize AI to generate resume content based on
                     the information you provide. While we strive for accuracy,
                     the AI-generated content is provided "as is" and without
                     any warranty of any kind, either express or implied. You
                     are responsible for reviewing and editing the AI-generated
                     content to ensure its accuracy and completeness. We are not
                     liable for any errors or omissions in the AI-generated
                     content.
                  </p>
               </li>
               {/* Continue adding sections similarly */}
               <li>
                  <strong>User Content:</strong>
                  <p>
                     You are responsible for the content you provide to the
                     Services ("User Content"). You represent and warrant that
                     you have all necessary rights to your User Content. You
                     grant us a non-exclusive, royalty-free license to use your
                     User Content to provide the Services. We reserve the right
                     to remove or modify any User Content that violates these
                     Terms.
                  </p>
               </li>
               <li>
                  <strong>Payment and Subscription:</strong>
                  <ul className="list-disc pl-5 mt-2 space-y-2">
                     <li>
                        Some features of the Services may require a paid
                        subscription.
                     </li>
                     <li>
                        The fees for our subscriptions are stated on our pricing
                        page and are subject to change.
                     </li>
                     <li>Payments are processed through [Payment Gateway].</li>
                     <li>
                        Subscriptions may automatically cancelled after endDate
                        of premium and you have to repeat the payment for
                        getting premium again.
                     </li>
                  </ul>
               </li>
               <li>
                  <strong>Intellectual Property:</strong>
                  <ul className="list-disc pl-5 mt-2 space-y-2">
                     <li>
                        The Services and all content included therein, including
                        but not limited to text, graphics, logos, and software,
                        are the property of [Your Company Name] and are
                        protected by copyright and other intellectual property
                        laws.
                     </li>
                     <li>
                        You may not use any content from the Services without
                        our prior written consent.
                     </li>
                  </ul>
               </li>
               <li>
                  <strong>Disclaimer of Warranties:</strong>
                  <p>
                     The Services are provided "as is" and without any warranty
                     of any kind, either express or implied. We do not warrant
                     that the Services will be uninterrupted, error-free, or
                     that any results will be achieved.
                  </p>
               </li>
               <li>
                  <strong>Limitation of Liability:</strong>
                  <p>
                     To the fullest extent permitted by law, we will not be
                     liable for any indirect, incidental, special,
                     consequential, or punitive damages arising out of or
                     related to your use of the Services.
                  </p>
               </li>
               {/* <li>
                  <strong>Governing Law:</strong>
                  <p>
                     These Terms will be governed by and construed in accordance
                     with the laws of [Your Jurisdiction].
                  </p>
               </li> */}
               <li>
                  <strong>Changes to Terms:</strong>
                  <p>
                     We reserve the right to modify these Terms at any time
                     without notice. Your continued use of the Services after
                     any changes are made constitutes your acceptance of the
                     revised Terms.
                  </p>
               </li>
               <li>
                  <strong>Contact Us:</strong>
                  <p>
                     If you have any questions about these Terms, please contact
                     us at [Your Contact Information].
                  </p>
               </li>
            </ol>
         </div>
      </div>
   );
};

export default TermsAndConditions;
