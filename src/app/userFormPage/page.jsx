"use client";
import UserForm from "../../components/UserForm";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { UserDetailsService } from "../../services/UserDetailsService";
import { Spinner } from "../../components/ui/spinner";
import { useSelector, useDispatch } from "react-redux";
import { setUserDetails } from "../../store/slices/firebaseSlice";

export default function UserFormPage() {
   const { user, loading } = useSelector((state) => state.auth);
   const { userDetails } = useSelector((state) => state.firebase);
   const dispatch = useDispatch();
   const router = useRouter();
   const searchParams = useSearchParams();
   const isEditing = searchParams.get("edit") === "true";
   const [isSaving, setIsSaving] = useState(false);

   useEffect(() => {
      if (!loading) {
         if (!user) {
            router.push("/");
            return;
         }

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
         await UserDetailsService.saveUserDetails(user.uid, details);
         const updatedDetails = await UserDetailsService.getUserDetails(
            user.uid
         );
         dispatch(setUserDetails(updatedDetails));
         router.push("/dashboard");
      } catch (error) {
         console.error("Error saving user details:", error);
         alert("Failed to save details. Please try again.");
      } finally {
         setIsSaving(false);
      }
   };

   if (loading || isSaving) {
      return (
         <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
            <div className="text-center space-y-4">
               <Spinner className="w-12 h-12 border-4 text-indigo-600" />
               <p className="text-gray-600 font-medium">
                  {loading ? "Loading..." : "Saving your details..."}
               </p>
            </div>
         </div>
      );
   }

   if (!user) return null;

   return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
         <div className="container mx-auto py-8 px-4 pt-28">
            <UserForm
               initialData={userDetails}
               onSave={handleSaveDetails}
               onCancel={() => router.push("/dashboard")}
            />
         </div>
      </div>
   );
}
