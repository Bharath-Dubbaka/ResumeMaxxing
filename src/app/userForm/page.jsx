"use client";
import { useAuth } from "@/context/AuthContext";
import UserForm from "@/components/UserForm";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { UserDetailsService } from "@/services/UserDetailsService";

export default function UserFormPage() {
   const { user, userDetails, loading, refreshUserDetails } = useAuth();
   const router = useRouter();
   const searchParams = useSearchParams();
   const isEditing = searchParams.get("edit") === "true";
   const [isSaving, setIsSaving] = useState(false);

   useEffect(() => {
      if (!loading) {
         // If no user, redirect to home
         if (!user) {
            router.push("/");
            return;
         }

         // Only redirect if not editing and user has details
         if (userDetails && !isEditing) {
            router.push("/dashboard");
            return;
         }
      }
   }, [loading, user, userDetails, router, isEditing]);

   const handleSaveDetails = async (details) => {
      try {
         if (!user) return;

         setIsSaving(true);
         console.log("Saving user details:", details);
         await UserDetailsService.saveUserDetails(user.uid, details);
         await refreshUserDetails(user.uid);
         console.log("Details saved successfully");
         router.push("/dashboard");
      } catch (error) {
         console.error("Error saving user details:", error);
         alert("Failed to save details. Please try again.");
      } finally {
         setIsSaving(false);
      }
   };

   if (loading || isSaving) return <LoadingSpinner />;
   if (!user) return null;

   return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200/60 via-slate-50 to-blue-200/60">
         <div className="container mx-auto py-8 px-4">
            <UserForm
               initialData={userDetails}
               onSave={handleSaveDetails}
               onCancel={() => router.push("/dashboard")}
            />
         </div>
      </div>
   );
}
