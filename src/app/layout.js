import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
   title: "ResumeMaxx - AI-Powered Resume Builder",
   description:
      "Create professional resumes with AI-powered tools and land your dream job.",
};

export default function RootLayout({ children }) {
   return (
      <html lang="en">
         <body className={inter.className}>
            <AuthProvider>
               <Header />
               <main className="min-h-screen">{children}</main>
               <Footer />
            </AuthProvider>
         </body>
      </html>
   );
}
