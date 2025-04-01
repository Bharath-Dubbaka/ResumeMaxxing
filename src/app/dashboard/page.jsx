"use client";
import { Spinner } from "../../components/ui/spinner";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import JobDescriptionAnalyzer from "../../components/JobDescriptionAnalyzer";
import ResumeGenerator from "../../components/ResumeGenerator";
import { toast, Toaster } from "sonner";

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
         <Toaster
            position="top-center"
            toastOptions={{
               style: {
                  background: "lightblue",
               },
               className: "class",
            }}
         />

         <div className="px-2 sm:px-20 py-8 pt-20 sm:pt-16 rounded-xl">
            <h1 className="text-3xl font-bold mb-8 "></h1>
            <div className="p-4 mb-2 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg text-sm text-gray-700">
               <p>
                  <strong>How to use this tool:</strong>
               </p>
               <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>
                     <strong>Option 1:</strong> Paste a job description and
                     click <em>"Analyze Job Description"</em> to extract key
                     requirements.
                  </li>
                  <li>
                     <strong>Option 2:</strong> Click <em>"Generate Resume"</em>{" "}
                     to create a resume based on the analyzed job description
                     and extracted skills, or generate it using only your saved
                     custom data (no job description required).
                  </li>
                  <li>
                     The resume will be personalized based on the analyzed job
                     description (if provided) or your stored details.
                  </li>
               </ul>
            </div>
            <JobDescriptionAnalyzer />
            <ResumeGenerator />
         </div>
      </div>
   );
}
