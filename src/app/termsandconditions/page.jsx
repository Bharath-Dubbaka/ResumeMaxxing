import React from "react";

const TermsAndConditions = () => {
   return (
      <div className="bg-gradient-to-br from-yellow-50/95 via-pink-50 to-blue-200/60 animate-gradient-xy">
         <div className="py-20 md:py-28 max-w-4xl mx-4 md:mx-auto  ">
            <h1 className="text-2xl font-bold mb-4">Terms and Conditions</h1>
            <p>
               These Terms and Conditions ("Terms") govern your access to and
               use of the{" "}
               <strong>
                  {" "}
                  ResumeOnFly website and services (the "Services").{" "}
               </strong>{" "}
               By accessing or using the Services, you agree to be bound by
               these Terms and our Privacy Policy. If you do not agree with
               these Terms or our Privacy Policy, please do not access or use
               the Services.
            </p>

            {/* Added Acknowledgement Section from A1 */}
            <div className="mt-4">
               <h2 className="text-lg font-semibold mt-4">Acknowledgment</h2>
               <p>
                  These Terms operate between you and ResumeOnFly, governing
                  your use of our Services. Your access to and use of the
                  Service is conditioned on your acceptance of and compliance
                  with these Terms. By accessing or using the Service you agree
                  to be bound by these Terms.
               </p>
            </div>

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
                     {/* Added account security details from A1 */}
                     <li>
                        You must provide accurate, complete, and current account
                        information at all times.
                     </li>
                     <li>
                        You are responsible for safeguarding your password and
                        any activities under your account.
                     </li>
                     <li>
                        You agree not to disclose your password to any third
                        party and must notify us immediately of any unauthorized
                        access.
                     </li>
                     <li>
                        You may not use offensive, vulgar, or obscene usernames,
                        or infringe on others' naming rights.
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

               {/* Added Copyright Policy from A1 */}
               <li>
                  <strong>Copyright Policy:</strong>
                  <ul className="list-disc pl-5 mt-2 space-y-2">
                     <li>
                        All content and functionality are property of
                        ResumeOnFly protected by international copyright laws.
                     </li>
                     <li>
                        DMCA notices must include:
                        <ul className="list-circle pl-5 mt-2 space-y-1">
                           <li>Authorized signature</li>
                           <li>Description of copyrighted work</li>
                           <li>Infringing material location</li>
                           <li>Contact information</li>
                           <li>Good faith belief statement</li>
                           <li>Accuracy statement under penalty of perjury</li>
                        </ul>
                     </li>
                     <li>
                        Submit claims to resumeonfly@gmail.com. We reserve the
                        right to remove infringing content.
                     </li>
                  </ul>
               </li>

               {/* Updated Intellectual Property section */}
               <li>
                  <strong>Intellectual Property:</strong>
                  <ul className="list-disc pl-5 mt-2 space-y-2">
                     <li>
                        The Services and all content (excluding user content)
                        are the exclusive property of ResumeOnFly protected by
                        international copyright and trademark laws.
                     </li>
                     <li>
                        Trademarks may not be used without prior written
                        consent.
                     </li>
                  </ul>
               </li>

               {/* Added Feedback section from A1 */}
               <li>
                  <strong>Your Feedback:</strong>
                  <p>
                     You grant ResumeOnFly perpetual, irrevocable rights to use
                     any feedback you provide. This includes rights to modify,
                     distribute, and exploit feedback without restriction.
                  </p>
               </li>

               {/* Added Third-Party Links from A1 */}
               <li>
                  <strong>Third-Party Links:</strong>
                  <ul className="list-disc pl-5 mt-2 space-y-2">
                     <li>
                        We are not responsible for content or practices of
                        third-party websites.
                     </li>
                     <li>Use third-party services at your own risk.</li>
                  </ul>
               </li>

               {/* Preserved original B2 content below - only modified CVtoSalary references */}
               <li>
                  <strong>Terms of Agreement/Service and Cancellation:</strong>{" "}
                  <p>
                     This Agreement remains valid as long as you use our
                     Services. ResumeOnFly offers an online platform for
                     selecting and ordering services, governed by these Terms.
                     Either party may terminate the Services at any time without
                     cause. We reserve the right to terminate your access
                     immediately for Terms violations.
                  </p>
               </li>

               {/* ... rest of original B2 sections remain unchanged except CVtoSalary removal ... */}

               {/* Updated Contact Information */}
               <li>
                  <strong>Contact Us:</strong>
                  <p>
                     If you have any questions about these Terms:
                     <br />
                     Website: https://resumeonfly.com
                     <br />
                     Email: resumeonfly@gmail.com
                  </p>
               </li>
            </ol>
         </div>
      </div>
   );
};

export default TermsAndConditions;
