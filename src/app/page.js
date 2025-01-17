import { Button } from "@/components/ui/button";

export default function Home() {
   return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-yellow-50 to-blue-100 animate-gradient-xy">
         <div className="container mx-auto px-4 py-16">
            {/* Hero Section */}
            <div className="text-center space-y-8 py-20">
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
            </div>

            {/* Features Section */}
            <div className="grid md:grid-cols-3 gap-8 py-20 px-20">
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
      </div>
   );
}

function FeatureCard({ title, description }) {
   return (
      <div className="p-6 rounded-lg bg-white border border-slate-400 hover:border-slate-500 transition-all">
         <h3 className="text-xl font-semibold text-slate-900 mb-3">{title}</h3>
         <p className="text-slate-500">{description}</p>
      </div>
   );
}
