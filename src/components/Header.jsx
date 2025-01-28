"use client";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import { clearFirebaseData } from "../store/slices/firebaseSlice";
import { auth } from "../services/firebase";
import { CheckCircle } from "lucide-react";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "../components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { QuotaService } from "../services/QuotaService";
import { UserDetailsService } from "../services/UserDetailsService";
import { setUser } from "../store/slices/authSlice";
import { setUserDetails, setUserQuota } from "../store/slices/firebaseSlice";
import { Roboto_Slab, Inter } from "next/font/google"; // Import Inter here!

const inter = Inter({ subsets: ["latin"] }); // Initialize Inter font
const robotoSlab = Roboto_Slab({ subsets: ["latin"] });

const Header = () => {
   const { user } = useSelector((state) => state.auth);
   const { userQuota, userDetails } = useSelector((state) => state.firebase);
   const dispatch = useDispatch();
   const router = useRouter();
   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
   const [isLoading, setIsLoading] = useState(false);

   const handleLogout = async () => {
      try {
         console.log("Logging out...");
         await auth.signOut();
         dispatch(logout());
         dispatch(clearFirebaseData());
         console.log("Logout successful");
      } catch (error) {
         console.error("Logout error:", error);
      }
   };

   const handleGetStarted = async () => {
      try {
         setIsLoading(true);

         if (user) {
            if (userDetails) {
               router.push("/dashboard");
            } else {
               router.push("/userForm");
            }
            return;
         }

         const provider = new GoogleAuthProvider();
         const result = await signInWithPopup(auth, provider);

         dispatch(
            setUser({
               email: result.user.email,
               name: result.user.displayName,
               picture: result.user.photoURL,
               uid: result.user.uid,
            })
         );

         const quota = await QuotaService.getUserQuota(result.user.uid);
         dispatch(setUserQuota(quota));

         const details = await UserDetailsService.getUserDetails(
            result.user.uid
         );
         dispatch(setUserDetails(details));

         if (details) {
            router.push("/dashboard");
         } else {
            router.push("/userForm");
         }
      } catch (error) {
         console.error("Login error:", error);
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <header className="border-b bg-white/70 backdrop-blur-md fixed top-0 w-full z-50">
         <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-[4.3rem]">
               {/* Logo */}
               <Link href="/" className="flex items-center space-x-2">
                  <svg
                     xmlns="http://www.w3.org/2000/svg"
                     viewBox="0 0 50 48"
                     className="h-10 ml-2"
                  >
                     {/* Paper/Wing Shape */}
                     {/* <path
                        d="M20 36c0 0-8-16 0-24s24-4 32-12s8-8 8-8s4 12-4 20-20 8-28 16S20 36 20 36z"
                        fill="url(#gradient1)"
                     /> */}

                     {/* Document Base */}
                     <rect
                        x="12"
                        y="8"
                        width="28"
                        height="36"
                        rx="2"
                        fill="url(#gradient2)"
                     />

                     {/* Document Lines */}
                     <rect
                        x="18"
                        y="16"
                        width="16"
                        height="2"
                        rx="1"
                        fill="#fff"
                        opacity="0.6"
                     />
                     <rect
                        x="18"
                        y="22"
                        width="12"
                        height="2"
                        rx="1"
                        fill="#fff"
                        opacity="0.6"
                     />
                     <rect
                        x="18"
                        y="28"
                        width="14"
                        height="2"
                        rx="1"
                        fill="#fff"
                        opacity="0.6"
                     />

                     {/* Gradients */}
                     <defs>
                        <linearGradient
                           id="gradient1"
                           x1="0"
                           y1="20"
                           x2="100%"
                           y2="100%"
                        >
                           <stop offset="0%" stopColor="#818CF8" />
                           <stop offset="100%" stopColor="#f0f569" />
                        </linearGradient>
                        <linearGradient
                           id="gradient2"
                           x1="0"
                           y1="0"
                           x2="100%"
                           y2="100%"
                        >
                           <stop offset="0%" stopColor="#6366F1" />
                           <stop offset="100%" stopColor="#4F46E5" />
                        </linearGradient>
                     </defs>
                  </svg>
                  <span
                     className={`text-[2.3rem] font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent hover:from-pink-500 hover:via-purple-600 hover:to-indigo-600 transition-all duration-300 ${inter.className} font-inter`}
                  >
                     ResumeOnFly
                  </span>
               </Link>

               {/* Navigation */}
               <nav className="hidden md:flex items-center space-x-8">
                  {["Faq", "Pricing", "About"].map((item) => (
                     <Link
                        key={item}
                        href={`/${item.toLowerCase()}`}
                        className="text-slate-600 hover:text-indigo-600 font-medium transition-colors duration-200 hover:scale-105 transform"
                     >
                        {item}
                     </Link>
                  ))}
               </nav>

               {/* User Section */}
               {user && userQuota ? (
                  <div className="flex items-center gap-4 relative">
                     <div className="flex items-center gap-2">
                        {user.picture ? (
                           <img
                              src={user.picture}
                              alt={user.name}
                              className="w-8 h-8 rounded-full border-2 border-indigo-200 hover:border-indigo-400 transition-colors duration-200"
                           />
                        ) : (
                           <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-medium">
                              {user.name?.charAt(0)}
                           </div>
                        )}
                        <div className="text-sm mr-1">
                           <p className="text-slate-900 font-medium flex items-center">
                              {user.name}
                              <span className="text-xs bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2 py-0.5 rounded-full ml-2 shadow-sm">
                                 {userQuota.subscription.type}
                              </span>
                           </p>
                        </div>

                        {/* Dropdown Trigger */}
                        <button
                           onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                           className="p-1.5 hover:bg-indigo-100 rounded-full transition-colors duration-200"
                        >
                           <svg
                              className={`w-4 h-4 text-indigo-600 transition-transform duration-200 ${
                                 isDropdownOpen ? "rotate-180" : ""
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                           >
                              <path
                                 strokeLinecap="round"
                                 strokeLinejoin="round"
                                 strokeWidth={2}
                                 d="M19 9l-7 7-7-7"
                              />
                           </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                           <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-lg border border-indigo-100 py-2 z-50">
                              <div className="px-4 py-2 border-b border-indigo-100">
                                 <p className="text-xs text-indigo-600">
                                    {user.email}
                                 </p>
                              </div>
                              {/* Upgrade to premium btn here and for user who are already on premium will be shown there premium endDate */}
                              {/* Premium Section */}
                              <div className="px-4 py-3 border-b border-indigo-100">
                                 {userQuota.subscription.type === "free" ? (
                                    <button
                                       onClick={() => router.push("/pricing")}
                                       className="w-full py-2 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                                    >
                                       <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                       >
                                          <path
                                             strokeLinecap="round"
                                             strokeLinejoin="round"
                                             strokeWidth={2}
                                             d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                                          />
                                       </svg>
                                       Upgrade to Premium
                                    </button>
                                 ) : (
                                    <div className="text-sm">
                                       <p className="text-slate-600 mb-1">
                                          Premium Subscription
                                       </p>
                                       <p className="font-medium text-indigo-600 flex items-center gap-2">
                                          <svg
                                             className="w-4 h-4"
                                             fill="none"
                                             stroke="currentColor"
                                             viewBox="0 0 24 24"
                                          >
                                             <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                             />
                                          </svg>
                                          Expires on{" "}
                                          {new Date(
                                             userQuota.subscription.endDate
                                          ).toLocaleDateString()}
                                       </p>
                                    </div>
                                 )}
                              </div>
                              <div className="px-4 py-2 border-b border-indigo-100 bg-gradient-to-br from-white to-indigo-50">
                                 <p className="text-sm font-medium text-indigo-900 mb-2">
                                    Usage Quota
                                 </p>
                                 <div className="space-y-2">
                                    {[
                                       {
                                          label: "Parsing",
                                          used: userQuota.parsing.used,
                                          limit: userQuota.parsing.limit,
                                       },
                                       {
                                          label: "Generates",
                                          used: userQuota.generates.used,
                                          limit: userQuota.generates.limit,
                                       },
                                       {
                                          label: "Downloads",
                                          used: userQuota.downloads.used,
                                          limit: userQuota.downloads.limit,
                                       },
                                    ].map((item) => (
                                       <div
                                          key={item.label}
                                          className="flex justify-between text-xs"
                                       >
                                          <span className="text-slate-600">
                                             {item.label}
                                          </span>
                                          <span className="text-indigo-600 font-medium">
                                             {item.used}/{item.limit}
                                          </span>
                                       </div>
                                    ))}
                                 </div>
                              </div>

                              <button
                                 onClick={() => {
                                    router.push("/userFormPage?edit=true");
                                    setIsDropdownOpen(false);
                                 }}
                                 className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-indigo-50 flex items-center transition-colors duration-200"
                              >
                                 <svg
                                    className="w-4 h-4 mr-2 text-indigo-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                 >
                                    <path
                                       strokeLinecap="round"
                                       strokeLinejoin="round"
                                       strokeWidth={2}
                                       d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                    />
                                    <path
                                       strokeLinecap="round"
                                       strokeLinejoin="round"
                                       strokeWidth={2}
                                       d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                 </svg>
                                 Edit Details/Master Copy
                              </button>

                              <button
                                 onClick={() => {
                                    handleLogout();
                                    setIsDropdownOpen(false);
                                 }}
                                 className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors duration-200"
                              >
                                 <LogOut className="w-4 h-4 mr-2" />
                                 Logout
                              </button>
                           </div>
                        )}
                     </div>
                  </div>
               ) : (
                  <div className="flex items-center space-x-4">
                     <Button
                        onClick={handleGetStarted}
                        variant="ghost"
                        className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors duration-200"
                     >
                        Sign In
                     </Button>
                     <Button
                        onClick={handleGetStarted}
                        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-pink-500 hover:via-purple-600 hover:to-indigo-600 text-white transition-all duration-300 shadow-md hover:shadow-lg"
                     >
                        FREE Trial
                     </Button>
                  </div>
               )}
            </div>
         </div>
      </header>
   );
};

export default Header;
