import { Inter, Roboto_Mono, Roboto_Slab } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Providers } from "../components/Providers";
import FirestoreSubscription from "../components/FirestoreSubscription";

const inter = Inter({ subsets: ["latin"] });
const roboto = Roboto_Mono({ subsets: ["latin"] });
const serif = Roboto_Slab({ subsets: ["latin"] });
export const metadata = {
   title: "ResumeMaxx - AI-Powered Resume Builder",
   description:
      "Create professional resumes with AI-powered tools and land your dream job.",
};

export default function RootLayout({ children }) {
   return (
      <html lang="en">
         <body className={roboto.className}>
            <Providers>
               <FirestoreSubscription />
               <Header />
               <main className="min-h-screen">{children}</main>
               <Footer />
            </Providers>
         </body>
      </html>
   );
}
