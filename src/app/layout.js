import { Inter, Roboto_Mono, Roboto_Slab, Roboto } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Providers } from "../components/Providers";
import FirestoreSubscription from "../components/FirestoreSubscription";
import Analytics from "../components/Analytics";

const inter = Inter({ subsets: ["latin"] });
const robotoMono = Roboto_Mono({ subsets: ["latin"] });
const robotoSlab = Roboto_Slab({ subsets: ["latin"], weights: ["400", "700"] });

export const metadata = {
   title: {
      default: "ResumeOnFly: AI Resume Builder That Gets 3x More Interviews",
      template: "%s | ResumeOnFly",
   },
   description:
      "Beat ATS systems & land dream jobs faster! AI-powered resume builder creates recruiter-approved resumes tailored to job descriptions in 5 minutes. Free trial + 97% satisfaction rate.",

   openGraph: {
      type: "website",
      url: "https://resumeonfly.com/",
      title: "🚀 Get Hired Faster: AI-Optimized Resumes with 97% ATS Success Rate",
      description:
         "Tired of resume rejections? Our AI analyzes job descriptions, optimizes keywords, and formats resumes for maximum recruiter impact. Free ATS check included!",
      siteName: "ResumeOnFly by CVtoSalary",
      images: [
         {
            url: "https://resumeonfly.com/opengrapgh-image.png",
            width: 1200,
            height: 630,
            alt: "AI transforming resume into job offer with 90% success rate badge",
         },
      ],
   },

   twitter: {
      card: "summary_large_image",
      title: "The Resume Secret Top Candidates Know 🤫",
      description:
         "How to create ATS-friendly resumes that get 3x more callbacks (AI-powered + recruiter-approved templates). Free trial →",
      images: ["https://resumeonfly.com/opengrapgh-image.png"],
      creator: "@resumeonfly",
   },

   keywords: [
      "ATS resume builder",
      "AI resume writer",
      "recruiter-approved format",
      "resume keyword optimizer",
   ],
};

export default function RootLayout({ children, pageProps }) {
   return (
      <html lang="en">
         <body className={inter.className}>
            <Analytics />
            <Providers>
               <FirestoreSubscription />
               <Header {...pageProps} />
               <main className="min-h-screen">{children}</main>
               <Footer />
            </Providers>
         </body>
      </html>
   );
}
