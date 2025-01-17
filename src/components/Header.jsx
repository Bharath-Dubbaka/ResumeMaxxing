import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Header = () => {
   return (
      <header className="border-b bg-white/50 backdrop-blur-md fixed top-0 w-full z-50">
         <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
               {/* Logo */}
               <Link href="/" className="flex items-center space-x-2">
                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-pink-900 bg-clip-text text-transparent">
                     ResumeMaxxing
                  </span>
               </Link>

               {/* Navigation */}
               <nav className="hidden md:flex items-center space-x-8">
                  <Link
                     href="/templates"
                     className="text-slate-600 hover:text-slate-900"
                  >
                     Templates
                  </Link>
                  <Link
                     href="/pricing"
                     className="text-slate-600 hover:text-slate-900"
                  >
                     Pricing
                  </Link>
                  <Link
                     href="/about"
                     className="text-slate-600 hover:text-slate-900"
                  >
                     About
                  </Link>
               </nav>

               {/* Auth Buttons */}
               <div className="flex items-center space-x-4">
                  <Button
                     variant="ghost"
                     className="text-slate-600 hover:text-slate-900"
                  >
                     Sign In
                  </Button>
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                     Get Started
                  </Button>
               </div>
            </div>
         </div>
      </header>
   );
};

export default Header;
