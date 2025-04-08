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
      default:
         "ResumeOnFly: Updates your resume according to Job description in Minutes",
      template: "%s | ResumeOnFly",
   },
   description:
      "Tired of updating resume for each and every Job Description? let our AI do that in just Minutes for FREE, get 100 resume downloads for just $10.99.",

   openGraph: {
      type: "website",
      url: "https://resumeonfly.com/",
      title: "🚀 Updates your resume according to Job description in Minutes",
      description:
         "Tired of updating resume for each and every Job Description? let our AI do that in just Minutes for FREE, get 100 resume downloads for just $10.99.",
      siteName: "ResumeOnFly",
      images: [
         {
            url: "https://resumeonfly.com/opengrapgh-image.png",
            width: 1200,
            height: 630,
            alt: "Tired of updating resume for each and every Job Description? let our AI do that in just Minutes for FREE, get 100 resume downloads for just $10.99.",
         },
      ],
   },

   twitter: {
      card: "summary_large_image",
      title: "🚀 Updates your resume according to Job description in Minutes",
      description:
         "Tired of updating resume for each and every Job Description? let our AI do that in just Minutes for FREE, get 100 resume downloads for just $10.99.",
      images: ["https://resumeonfly.com/opengrapgh-image.png"],
      creator: "@resumeonfly",
   },
   linkedin: {
      card: "summary_large_image",
      title: "🚀 Updates your resume according to Job description in Minutes",
      description:
         "Tired of updating resume for each and every Job Description? let our AI do that in just Minutes for FREE, get 100 resume downloads for just $10.99.",
      images: ["https://resumeonfly.com/opengrapgh-image.png"],
      creator: "@resumeonfly",
   },

   keywords: [
      "AI resume builder",
      "AI resume update",
      "Customize resume as per job descriptions",
      "AI resume customization",
      "AI Job Hunting Tool",
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
