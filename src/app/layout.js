import { Inter, Roboto_Mono, Roboto_Slab, Roboto } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Providers } from "../components/Providers";
import FirestoreSubscription from "../components/FirestoreSubscription";

const inter = Inter({ subsets: ["latin"] });
const robotoMono = Roboto_Mono({ subsets: ["latin"] });
const robotoSlab = Roboto_Slab({ subsets: ["latin"], weights: ["400", "700"] });

export const metadata = {
   title: "ResumeMaxx - AI-Powered Resume Builder",
   description:
      "Create professional resumes with AI-powered tools and land your dream job.",
};

export default function RootLayout({ children, pageProps }) {
   return (
      <html lang="en">
         <body className={inter.className}>
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
