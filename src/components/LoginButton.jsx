"use client";
import { auth } from "../services/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { QuotaService } from "../services/QuotaService";

export default function LoginButton() {
   const handleGoogleLogin = async () => {
      try {
         console.log("Starting Google login...");
         const provider = new GoogleAuthProvider();
         const result = await signInWithPopup(auth, provider);
         console.log("Login successful:", result.user);

         await QuotaService.getUserQuota(result.user.uid);
      } catch (error) {
         console.error("Login error:", error);
      }
   };

   return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200/60 via-slate-50 to-blue-200/60">
         <div className="flex items-center justify-center h-screen">
            <button
               onClick={handleGoogleLogin}
               className="bg-purple-600 hover:bg-purple-700 px-5 py-2 text-sm font-bold rounded-lg flex items-center gap-2 text-white transition-all duration-200"
            >
               Sign in with Google
            </button>
         </div>
      </div>
   );
}
