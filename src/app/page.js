import { Button } from "@/components/ui/button";
import FeatureCard from "../components/ui/FeaturedCard";
import VideoSection from "../components/ui/VideoSection";

export default function Home() {
   return (
      <div className="">
         <div className="">
            {/* Hero Section */}
            <div className="min-h-screen text-center space-y-8 pt-32 bg-gradient-to-br from-purple-200/60 via-slate-50 to-blue-200/60 animate-gradient-xy">
               <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-pink-900">
                  AI-Powered Resume Builder
               </h1>
               <p className="text-slate-900 text-xl md:text-2xl max-w-2xl mx-auto">
                  Create professional resumes in minutes with our advanced AI
                  technology. Stand out from the crowd and land your dream job.
               </p>
               <div className="space-x-4">
                  <Button
                     size="lg"
                     className="bg-purple-600 hover:bg-purple-700"
                  >
                     Get Started
                  </Button>
                  <Button size="lg" variant="outline">
                     View Examples
                  </Button>
               </div>
               {/* Features Section */}
               <div className="grid md:grid-cols-3 gap-8 pt-10 mb-10 px-20">
                  <FeatureCard
                     title="AI-Powered Writing"
                     description="Our AI analyzes your experience and generates professional descriptions that highlight your achievements."
                  />
                  <FeatureCard
                     title="ATS-Friendly Templates"
                     description="Professionally designed templates that are optimized for Applicant Tracking Systems."
                  />
                  <FeatureCard
                     title="Real-Time Editing"
                     description="Edit and preview your resume in real-time with our intuitive interface."
                  />
               </div>
            </div>
            <VideoSection />
         </div>
      </div>
   );
}
