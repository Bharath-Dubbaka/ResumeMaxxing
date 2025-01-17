"use client";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/services/firebase";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Header = () => {
   const { user, userQuota } = useAuth();

   const handleLogout = async () => {
      try {
         console.log("Logging out...");
         await auth.signOut();
         console.log("Logout successful");
      } catch (error) {
         console.error("Logout error:", error);
      }
   };

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
               {user ? (
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-3">
                        {user.picture && (
                           <img
                              src={user.picture}
                              alt={user.name}
                              className="w-8 h-8 rounded-full border-2 border-slate-200"
                           />
                        )}
                        <div className="text-sm">
                           <p className="text-slate-900 font-medium">
                              {user.name}
                           </p>
                           <p className="text-slate-600 text-xs">
                              {user.email}
                           </p>
                        </div>
                     </div>
                     {userQuota && (
                        <div className="text-xs text-slate-700 bg-white/80 px-3 py-1 rounded-full">
                           {userQuota.subscription.type} Plan
                        </div>
                     )}
                     <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-white/80 rounded-lg hover:bg-white transition-all duration-200"
                     >
                        <LogOut size={16} />
                        Logout
                     </button>
                  </div>
               ) : (
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
               )}
            </div>
         </div>
      </header>
   );
};

export default Header;
