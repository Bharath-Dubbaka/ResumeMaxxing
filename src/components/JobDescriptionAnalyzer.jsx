"use client";
import { useState } from "react";
import { Button } from "../components/ui/button";
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from "../components/ui/card";
import { Spinner } from "../components/ui/spinner";
import { Textarea } from "../components/ui/textarea";
import { useSelector } from "react-redux";
import { QuotaService } from "../services/QuotaService";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { JsonParser } from "jsonparse";

const genAI = new GoogleGenerativeAI(
   process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY
);

export default function JobDescriptionAnalyzer() {
   const { user } = useSelector((state) => state.auth);
   const { userDetails } = useSelector((state) => state.firebase);
   const [jobDescription, setJobDescription] = useState("");
   const [isAnalyzing, setIsAnalyzing] = useState(false);
   const [analysis, setAnalysis] = useState(null);

   const analyzeJobDescription = async () => {
      setIsAnalyzing(true);
      try {
         if (!user?.uid) {
            throw new Error("User not authenticated");
         }

         const hasQuota = await QuotaService.checkQuota(user.uid, "parsing");
         if (!hasQuota) {
            throw new Error(
               "Parsing quota exceeded. Please upgrade your plan."
            );
         }

         const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_GEMINI_API_KEY;
         const API_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

         const prompt = `Analyze this job description as a professional resume writer. Respond ONLY with a JSON object in this exact format, no other text:
         {
            "technicalSkills": [array of strings],
            "yearsOfExperience": number,
            "softSkills": [array of strings],
            "roleDescriptions": [
               {
                  "title": string,
                  "organization": string,
                  "description": string
               }
            ]
         }

         Job Description: ${jobDescription}`;

         const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               contents: [
                  {
                     parts: [
                        {
                           text: prompt,
                        },
                     ],
                  },
               ],
            }),
         });

         if (!response.ok) {
            throw new Error("Failed to analyze job description");
         }

         const data = await response.json();
         const content = data.candidates[0].content.parts[0].text;

         // Extract JSON using regex
         const jsonMatch = content.match(/\{[\s\S]*\}/);
         if (!jsonMatch) {
            throw new Error("No valid JSON found in response");
         }

         const analysisResult = JSON.parse(jsonMatch[0]);
         setAnalysis(analysisResult);

         await QuotaService.incrementUsage(user.uid, "parsing");
         return analysisResult;
      } catch (error) {
         console.error("Analysis of JD error:", error);
         alert(error.message);
      } finally {
         setIsAnalyzing(false);
      }
   };

   return (
      <Card className="bg-white/60 shadow-lg border-0 backdrop-blur-2xl rounded-xl">
         <CardHeader className="border-b bg-white/40 backdrop-blur-xl px-6 py-4">
            <CardTitle className="text-xl font-semibold text-gray-800">
               Job Description Analyzer
            </CardTitle>
         </CardHeader>
         <CardContent className="p-6">
            <div className="space-y-4">
               <Textarea
                  placeholder="Paste your job description here..."
                  className="min-h-[200px] resize-none"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
               />
               <Button
                  onClick={analyzeJobDescription}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={isAnalyzing || !jobDescription.trim()}
               >
                  {isAnalyzing ? (
                     <>
                        <Spinner className="w-4 h-4 border-2 mr-2" />
                        Analyzing...
                     </>
                  ) : (
                     "Analyze Job Description"
                  )}
               </Button>

               {analysis && (
                  <div className="mt-6 space-y-6">
                     <div>
                        <h3 className="text-lg font-semibold mb-3">
                           Technical Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                           {analysis.technicalSkills.map((skill, index) => (
                              <span
                                 key={index}
                                 className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                              >
                                 {skill}
                              </span>
                           ))}
                        </div>
                     </div>

                     <div>
                        <h3 className="text-lg font-semibold mb-3">
                           Soft Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                           {analysis.softSkills.map((skill, index) => (
                              <span
                                 key={index}
                                 className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                              >
                                 {skill}
                              </span>
                           ))}
                        </div>
                     </div>

                     <div>
                        <h3 className="text-lg font-semibold mb-3">
                           Experience Required
                        </h3>
                        <p className="text-gray-700">
                           {analysis.yearsOfExperience} years
                        </p>
                     </div>

                     {analysis.roleDescriptions?.length > 0 && (
                        <div>
                           <h3 className="text-lg font-semibold mb-3">
                              Tailored Role Descriptions
                           </h3>
                           <div className="space-y-4">
                              {analysis.roleDescriptions.map((role, index) => (
                                 <div
                                    key={index}
                                    className="p-4 bg-gray-50 rounded-lg"
                                 >
                                    <h4 className="font-medium text-gray-900">
                                       {role.title} at {role.organization}
                                    </h4>
                                    <p className="mt-2 text-gray-600">
                                       {role.description}
                                    </p>
                                 </div>
                              ))}
                           </div>
                        </div>
                     )}
                  </div>
               )}
            </div>
         </CardContent>
      </Card>
   );
}
