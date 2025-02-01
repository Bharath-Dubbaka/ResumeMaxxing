import React from "react";

const PrivacyPolicy = () => {
   return (
      <div className="bg-gradient-to-br from-yellow-50/95 via-pink-50 to-blue-200/60 animate-gradient-xy">
         <div className="py-28 max-w-4xl mx-auto ">
            <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
            <p className="mb-2">
               Privacy Policy This Privacy Policy explains how ResumeOnFly, a
               product by CVtoSalary ("we," "us," or "our"), collects, uses, and
               shares your personal information when you use the ResumeOnFly
               website and services (the "Services").
            </p>
            <p>
               <strong>
                  Please note: Since ResumeOnFly is a product of CVtoSalary,
               </strong>{" "}
               you may see CVtoSalary's name during payment processing and other
               related transactions.
            </p>
            <ol className="list-decimal pl-5 mt-4 space-y-4">
               <li>
                  <strong>Information We Collect:</strong>
                  <ul className="list-disc pl-5 mt-2 space-y-2">
                     <li>
                        <strong>Personal Information:</strong> We may collect
                        personal information such as your name, email address,
                        contact information, work experience, education, and
                        skills. This information is provided by you when
                        creating your resume.
                     </li>
                     <li>
                        <strong>Usage Information:</strong> We may collect
                        information about how you use the Services, such as the
                        pages you visit, the features you use, and the time you
                        spend on the Services.
                     </li>
                     <li>
                        <strong>Device Information:</strong> We may collect
                        information about the device you use to access the
                        Services, such as your IP address, browser type, and
                        operating system.
                     </li>
                  </ul>
               </li>
               <li>
                  <strong>How We Use Your Information:</strong>
                  <ul className="list-disc pl-5 mt-2 space-y-2">
                     <li>
                        We use your personal information to provide and improve
                        the Services, including generating resumes, analyzing
                        job descriptions, and personalizing your experience.
                     </li>
                     <li>
                        We may use your usage information to understand how our
                        users interact with the Services and to identify areas
                        for improvement.
                     </li>
                     <li>
                        We may use your device information to ensure the
                        Services are compatible with your device.
                     </li>
                     <li>
                        We will not sell your personal information to third
                        parties.
                     </li>
                  </ul>
               </li>
               <li>
                  <strong>How We Share Your Information:</strong>
                  <ul className="list-disc pl-5 mt-2 space-y-2">
                     <li>
                        We may share your information with service providers who
                        assist us in providing the Services, such as payment
                        processors and hosting providers. We ensure these
                        providers are contractually obligated to protect your
                        data.
                     </li>
                     <li>
                        We may disclose your information if required by law or
                        legal process.
                     </li>
                  </ul>
               </li>
               <li>
                  <strong>Data Security:</strong>
                  <p>
                     We take reasonable measures to protect your personal
                     information from unauthorized access, use, or disclosure.
                     However, no method of transmission over the Internet, or
                     method of electronic storage, is 100% secure.
                  </p>
               </li>
               <li>
                  <strong>Data Retention:</strong>
                  <p>
                     We will retain your personal information for as long as
                     necessary to provide the Services and fulfill the purposes
                     described in this Privacy Policy.
                  </p>
               </li>
               <li>
                  <strong>Your Choices:</strong>
                  <ul className="list-disc pl-5 mt-2 space-y-2">
                     <li>
                        You may access, update, or delete your personal
                        information by contacting us.
                     </li>
                     <li>
                        You may opt out of receiving marketing communications
                        from us.
                     </li>
                  </ul>
               </li>
               <li>
                  <strong>Children's Privacy:</strong>
                  <p>
                     Our Services are not intended for children under the age of
                     13. We do not knowingly collect personal information from
                     children under 13.
                  </p>
               </li>
               <li>
                  <strong>Changes to this Privacy Policy:</strong>
                  <p>
                     We may update this Privacy Policy from time to time. We
                     will post any changes on the Services.
                  </p>
               </li>
               <li>
                  <strong>Contact Us:</strong>
                  <p>
                     If you have any questions about this Privacy Policy, please
                     contact us at [Your Contact Information].
                  </p>
               </li>
            </ol>
         </div>
      </div>
   );
};

export default PrivacyPolicy;
