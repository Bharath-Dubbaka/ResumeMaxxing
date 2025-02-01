import React from "react";
import Link from "next/link";

const Footer = () => {
   return (
      <footer className="bg-white border-t">
         <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
               {/* Brand Column */}
               <div className="space-y-4">
                  <h2 className="flex flex-col text-2xl font-bold bg-gradient-to-r from-blue-900 to-pink-900 bg-clip-text text-transparent">
                     ResumeOnFly
                     <span className="text-xs text-black font-normal">
                        prod by <span className="font-bold"> CVtoSalary</span>
                     </span>
                  </h2>
                  <p className="text-slate-600">
                     Create professional resumes with AI-powered tools and land
                     your dream job.
                  </p>
               </div>

               {/* Product Column */}
               <div>
                  <h3 className="font-semibold text-slate-900 mb-4">Product</h3>
                  <ul className="space-y-3">
                     <li>
                        <Link
                           href="/contact"
                           className="text-slate-600 hover:text-slate-900"
                        >
                           Contact
                        </Link>
                     </li>
                     <li>
                        <Link
                           href="/pricing"
                           className="text-slate-600 hover:text-slate-900"
                        >
                           Pricing
                        </Link>
                     </li>
                     {/* <li>
                        <Link
                           href="/features"
                           className="text-slate-600 hover:text-slate-900"
                        >
                           Features
                        </Link>
                     </li> */}
                  </ul>
               </div>

               {/* Company Column */}
               <div>
                  <h3 className="font-semibold text-slate-900 mb-4">Company</h3>
                  <ul className="space-y-3">
                     <li>
                        <Link
                           href="/about"
                           className="text-slate-600 hover:text-slate-900"
                        >
                           About
                        </Link>
                     </li>
                     <li>
                        <Link
                           href="/faq"
                           className="text-slate-600 hover:text-slate-900"
                        >
                           FAQs
                        </Link>
                     </li>
                     {/* <li>
                        <Link
                           href="/blog"
                           className="text-slate-600 hover:text-slate-900"
                        >
                           Blog
                        </Link>
                     </li> */}
                  </ul>
               </div>

               {/* Legal Column */}
               <div>
                  <h3 className="font-semibold text-slate-900 mb-4">Legal</h3>
                  <ul className="space-y-3">
                     <li>
                        <Link
                           href="/privacypolicy"
                           className="text-slate-600 hover:text-slate-900"
                        >
                           Privacy Policy
                        </Link>
                     </li>
                     <li>
                        <Link
                           href="/termsandconditions"
                           className="text-slate-600 hover:text-slate-900"
                        >
                           Terms and Conditions
                        </Link>
                     </li>
                     <li>
                        <Link
                           href="/refundandcancellation"
                           className="text-slate-600 hover:text-slate-900"
                        >
                           Refund and Cancellation
                        </Link>
                     </li>
                     {/* <li>
                        <Link
                           href="/cookies"
                           className="text-slate-600 hover:text-slate-900"
                        >
                           Cookie Policy
                        </Link>
                     </li> */}
                  </ul>
               </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t mt-12 pt-8">
               <p className="text-center text-slate-600">
                  © {new Date().getFullYear()} ResumeOnFly. All rights reserved.
               </p>
            </div>
         </div>
      </footer>
   );
};

export default Footer;
