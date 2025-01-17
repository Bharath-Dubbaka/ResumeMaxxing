"use client";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/services/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { QuotaService } from "@/services/QuotaService";
import UserForm from "@/components/UserForm";
import LoadingSpinner from "@/components/LoadingSpinner";
import Header from "@/components/Header";

export default function UserFormPage() {
   const { user, userDetails, loading } = useAuth();

   const handleGoogleLogin = async () => {
      try {
         console.log("Starting Google login...");
         const provider = new GoogleAuthProvider();
         const result = await signInWithPopup(auth, provider);
         console.log("Login successful:", result.user);

         // Initialize quota for new users
         const quota = await QuotaService.getUserQuota(result.user.uid);
         console.log("User quota initialized:", quota);
      } catch (error) {
         console.error("Login error:", error);
      }
   };

   if (loading) return <LoadingSpinner />;

   return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200/60 via-slate-50 to-blue-200/60">
         {!user ? (
            <div className="flex items-center justify-center h-[calc(100vh-64px)]">
               <button
                  onClick={handleGoogleLogin}
                  className="bg-purple-600 hover:bg-purple-700 px-5 py-2 text-sm font-bold rounded-lg flex items-center gap-2 text-white transition-all duration-200"
               >
                  Sign in with Google
               </button>
            </div>
         ) : (
            <div className="container mx-auto py-8 px-4">
               <UserForm initialData={userDetails} />
            </div>
         )}
      </div>
   );
}
