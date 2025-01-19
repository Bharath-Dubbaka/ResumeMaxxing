"use client";
import { Spinner } from "../../components/ui/spinner";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import JobDescriptionAnalyzer from "../../components/JobDescriptionAnalyzer";

export default function DashboardPage() {
   const { user, loading } = useSelector((state) => state.auth);
   const { userDetails } = useSelector((state) => state.firebase);
   const router = useRouter();

   useEffect(() => {
      if (!loading && !user) {
         router.push("/");
         return;
      }

      if (!loading && user && !userDetails) {
         router.push("/userForm");
      }
   }, [loading, user, userDetails, router]);

   if (loading) return <Spinner className="w-12 h-12 border-4 text-pink-600" />;
   if (!user || !userDetails) return null;

   return (
      <div className="container mx-auto py-8 px-4 mt-16">
         <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
         <JobDescriptionAnalyzer />
      </div>
   );
}
