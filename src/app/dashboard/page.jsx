"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function DashboardPage() {
   const { user, userDetails, loading } = useAuth();
   const router = useRouter();

   useEffect(() => {
      // If not loading and no user, redirect to home
      if (!loading && !user) {
         router.push("/");
         return;
      }

      // If user has no details, redirect to userForm
      if (!loading && user && !userDetails) {
         router.push("/userForm");
      }
   }, [loading, user, userDetails, router]);

   if (loading) return <LoadingSpinner />;
   if (!user || !userDetails) return null;

   return (
      // Your dashboard content here
      <div className="container mx-auto py-8 px-4 mt-16">
         <h1 className="text-3xl font-bold">Dashboard</h1>
         {/* Add your dashboard content */}
      </div>
   );
}
