"use client";
import { Spinner } from "../../components/ui/spinner";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import JobDescriptionAnalyzer from "../../components/JobDescriptionAnalyzer";
import ResumeGenerator from "../../components/ResumeGenerator";

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
         router.push("/userFormPage");
      }
   }, [loading, user, userDetails, router]);

   if (loading) return <Spinner className="w-12 h-12 border-4 text-pink-600" />;
   if (!user || !userDetails) return null;

   return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200/60 via-pink-50/95 to-blue-200/60 animate-gradient-xy">
         <div className=" px-24 py-8 pt-32 rounded-xl">
            <h1 className="text-3xl font-bold mb-8 ">- Dashboard</h1>
            <JobDescriptionAnalyzer />
            <ResumeGenerator />
         </div>
      </div>
   );
}
