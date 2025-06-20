import { GoogleGenerativeAI } from "@google/generative-ai";
import { QuotaService } from "../../../services/QuotaService";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

export async function POST(request) {
   try {
      const { jobDescription, user, workExperiences } = await request.json();

      if (!user?.uid) {
         return Response.json(
            { error: "User not authenticated" },
            { status: 401 }
         );
      }

      //checking if quota available or not
      const quota = await QuotaService.getUserQuota();

      const parsingUsed = quota?.parsing?.used ?? 0;
      const parsingLimit = quota?.parsing?.limit ?? 0;

      const hasQuota = parsingUsed < parsingLimit;

      if (!hasQuota) {
         throw new Error("Parsing quota exceeded. Please upgrade your plan.");
      }

      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `Analyze the following job description and work experiences in detail as you are a professional resume writer, including all the details and responsibilities and skills. Return only a JSON object with these exact keys:
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
      Job Description: ${jobDescription}
      Work Experiences: ${JSON.stringify(workExperiences)}
   
      For each role in work experiences, generate a "description" field explaining key responsibilities and achievements based on the job descriptions context and the skills listed.
   
      Return only the JSON object, no additional text or formatting.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let analysisResult;

      try {
         analysisResult = JSON.parse(response.text());
      } catch (error) {
         console.error("Error parsing Gemini response:", error);
         throw new Error("Failed to parse analysis results");
      }

      // Increment quota usage
      await QuotaService.incrementUsage("parsing");

      return Response.json(analysisResult);
   } catch (error) {
      console.error("Error analyzing job description:", error);
      return Response.json(
         { error: "Failed to analyze job description" },
         { status: 500 }
      );
   }
}
