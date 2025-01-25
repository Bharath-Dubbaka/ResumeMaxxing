"use client";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { clearFirebaseData } from "../store/slices/firebaseSlice";
import { auth } from "../services/firebase";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "../components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";

const Header = () => {
   const { user } = useSelector((state) => state.auth);
   const { userQuota, userDetails } = useSelector((state) => state.firebase);
   const dispatch = useDispatch();
   const router = useRouter();

   const handleLogout = async () => {
      try {
         console.log("Logging out...");
         await auth.signOut();
         dispatch(logout());
         dispatch(clearFirebaseData());
         console.log("Logout successful");
      } catch (error) {
         console.error("Logout error:", error);
      }
   };

   return (
      <header className="border-b bg-white/70 backdrop-blur-md fixed top-0 w-full z-50">
         <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
               {/* Logo */}
               <Link href="/" className="flex items-center space-x-2">
                  <span className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-pink-900 bg-clip-text text-transparent">
                     ResumeOnFly
                  </span>
               </Link>

               {/* Navigation */}
               <nav className="hidden md:flex items-center space-x-8">
                  <Link
                     href="/faq"
                     className="text-slate-600 hover:text-slate-900"
                  >
                     Faq
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

               {/* Auth Buttons and Quota Display */}
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
                        <div className="flex items-center gap-1">
                           <div className="text-xs text-slate-700 bg-white/80 px-3 py-1 rounded-full">
                              {userQuota.subscription.type} Plan
                           </div>
                           <div className="text-xs text-slate-700 bg-white/80 px-3 py-1 rounded-full">
                              Parsing: {userQuota.parsing.used}/
                              {userQuota.parsing.limit}
                           </div>
                           <div className="text-xs text-slate-700 bg-white/80 px-3 py-1 rounded-full">
                              Downloads: {userQuota.downloads.used}/
                              {userQuota.downloads.limit}
                           </div>
                           <div className="text-xs text-slate-700 bg-white/80 px-3 py-1 rounded-full">
                              Generates: {userQuota.generates.used}/
                              {userQuota.generates.limit}
                           </div>
                        </div>
                     )}
                     <Button
                        onClick={() => router.push("/userFormPage?edit=true")}
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg"
                     >
                        Edit Details
                     </Button>
                     <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900"
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
                     <Button className="bg-gradient-to-br from-purple-600  to-indigo-500  hover:from-indigo-500 hover:to-purple-500 text-white">
                        FREE Trail
                     </Button>
                  </div>
               )}
            </div>
         </div>
      </header>
   );
};

export default Header;
