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
import { useState, useRef, useEffect } from "react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { QuotaService } from "../services/QuotaService";
import { UserDetailsService } from "../services/UserDetailsService";
import { setUser } from "../store/slices/authSlice";
import { setUserDetails, setUserQuota } from "../store/slices/firebaseSlice";
import { Roboto_Slab, Inter } from "next/font/google";
import AuthService from "../services/AuthService";

const inter = Inter({ subsets: ["latin"] });
const robotoSlab = Roboto_Slab({ subsets: ["latin"] });

const Header = () => {
   const { user } = useSelector((state) => state.auth);
   const { userQuota, userDetails } = useSelector((state) => state.firebase);
   const dispatch = useDispatch();
   const router = useRouter();
   const [isLoading, setIsLoading] = useState(false);
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
   const dropdownRef = useRef(null);
   const [countryCode, setCountryCode] = useState(null);

   // Add this useEffect to detect country
   useEffect(() => {
      const detectCountry = async () => {
         try {
            const response = await fetch("https://ipapi.co/json/");
            const data = await response.json();
            setCountryCode(data.country_code); // 'IN' for India
         } catch (error) {
            console.error("Error detecting country:", error);
            setCountryCode(null); // Default to null if detection fails
         }
      };
      detectCountry();
   }, []);

   const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
         setIsDropdownOpen(false);
      }
   };

   useEffect(() => {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
         document.removeEventListener("mousedown", handleClickOutside);
      };
   }, []);

   const handleLogout = async () => {
      try {
         await AuthService.signOut(dispatch, logout, clearFirebaseData);
      } catch (error) {
         console.error("Logout error:", error);
      }
   };

   const handleGetStarted = async () => {
      try {
         setIsLoading(true);
         await AuthService.handleAuthFlow(dispatch, router, user, userDetails, {
            setUser,
            setUserQuota,
            setUserDetails,
         });
      } catch (error) {
         console.error("Login error:", error);
      } finally {
         setIsLoading(false);
      }
   };

   const handleUpgradeClick = async () => {
      // Option 1: Redirect to pricing page
      // router.push("/pricing");

      // Option 2: Implement payment flow directly

      if (userQuota?.subscription?.type === "premium") {
         alert("Already in premium mode");
         return;
      }

      setIsLoading(true);

      try {
         window.localStorage.removeItem("razorpay_payment_id");
         window.localStorage.removeItem("payment_verified");

         const currency = countryCode === "IN" ? "INR" : "USD";

         const response = await fetch("/api/payment/create-payment-link", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
               userId: user.uid,
               userEmail: user.email,
               userName: user.name,
               currency: currency,
            }),
         });

         const { paymentLink } = await response.json();

         if (!paymentLink) throw new Error("Failed to create payment link");

         // Handle different payment flows based on currency
         if (currency !== "INR") {
            window.location.href = paymentLink;
            return;
         } else {
            window.open(paymentLink, "_blank");
         }

         // Start polling logic (same as pricing page)
         console.log("Starting payment verification polling");
         const checkPaymentStatus = setInterval(async () => {
            try {
               // First check if payment was already verified in success page
               if (window.localStorage.getItem("payment_verified") === "true") {
                  console.log("Payment already verified in success page");
                  clearInterval(checkPaymentStatus);
                  window.localStorage.removeItem("payment_verified");
                  window.localStorage.removeItem("razorpay_payment_id");

                  // Refresh quota data and redirect
                  const quota = await QuotaService.getUserQuota();
                  dispatch(setUserQuota(quota));
                  router.push("/dashboard");
                  return;
               }

               // Check if we have a payment ID in localStorage
               const paymentId = window.localStorage.getItem(
                  "razorpay_payment_id"
               );

               // If no payment ID yet, just wait for the next poll
               if (!paymentId) {
                  console.log("No payment ID found yet, waiting...");
                  return;
               }

               console.log(
                  "Verifying payment ID from pricing page:",
                  paymentId
               );

               const verifyResponse = await fetch(
                  "/api/payment/verify-payment",
                  {
                     method: "POST",
                     headers: { "Content-Type": "application/json" },
                     body: JSON.stringify({
                        userId: user.uid,
                        paymentId: paymentId,
                     }),
                  }
               );

               if (!verifyResponse.ok) {
                  console.error(
                     `Verification response not OK: ${verifyResponse.status}`
                  );
                  const errorText = await verifyResponse.text();
                  console.error(`Error details: ${errorText}`);
                  return;
               }

               const data = await verifyResponse.json();
               console.log("Verification response:", data);

               if (data.success) {
                  console.log("Payment verified successfully!");
                  clearInterval(checkPaymentStatus);
                  window.localStorage.removeItem("razorpay_payment_id");
                  const quota = await QuotaService.getUserQuota();
                  dispatch(setUserQuota(quota));
                  router.push("/dashboard");
               } else {
                  console.log("Payment not verified yet", data);
               }
            } catch (error) {
               console.error("Error verifying payment:", error);
            }
         }, 2000);

         // Stop checking after 5 minutes
         setTimeout(() => {
            console.log("Payment polling timeout reached (5 minutes)");
            clearInterval(checkPaymentStatus);
            setIsLoading(false);
         }, 300000);
      } catch (error) {
         console.error("Error initiating payment:", error);
         if (setIsLoading) setIsLoading(false);
      }
   };

   // Navigation items - conditional based on login status
   const getNavigationItems = () => {
      const baseItems = ["Faq", "Pricing", "About"];

      // Add Dashboard and Master Resume links for logged-in users
      if (user && userQuota) {
         return [...baseItems, "Dashboard", "Master Resume"];
      }

      return baseItems;
   };

   // URLs for navigation items
   const getNavigationUrl = (item) => {
      const lowerItem = item.toLowerCase();

      // Special case for "Master Resume"
      if (lowerItem === "master resume") {
         return "/userFormPage";
      }

      return `/${lowerItem}`;
   };

   return (
      <header className="border-b bg-white/70 backdrop-blur-md fixed top-0 w-full z-50">
         <div className="px-1 sm:px-2 lg:px-6">
            <div className="flex items-center justify-between h-16 md:h-[5.3rem]">
               {/* Mobile Menu Button - Now visible up to lg screens */}
               <div className="lg:hidden flex items-center">
                  <button
                     onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                     className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg"
                  >
                     <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                     >
                        <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth={2}
                           d="M4 6h16M4 12h16M4 18h16"
                        />
                     </svg>
                  </button>
               </div>
               {/* Logo - Centered on Mobile */}
               <Link
                  href="/"
                  className="flex items-center space-x-1 md:ml-2 ml-0"
               >
                  <svg
                     xmlns="http://www.w3.org/2000/svg"
                     viewBox="0 0 50 48"
                     className="h-20 ml-1 max-w-[25%] sm:w-full md:ml-2"
                  >
                     {/* Document Shadow */}
                     <rect
                        x="14"
                        y="10"
                        width="28"
                        height="36"
                        rx="2"
                        fill="#3B82F6"
                        opacity="0.2"
                     />

                     {/* Document Base */}
                     <rect
                        x="12"
                        y="8"
                        width="28"
                        height="36"
                        rx="2"
                        fill="url(#gradient2)"
                     />

                     {/* Folded Corner */}
                     <path d="M40 8 L40 16 L32 8 Z" fill="url(#gradient1)" />
                     <path
                        d="M40 8 L40 16 L32 8 Z"
                        fill="url(#gradient1)"
                        opacity="0.8"
                     />

                     {/* Document Lines */}
                     <rect
                        x="18"
                        y="16"
                        width="16"
                        height="2"
                        rx="1"
                        fill="#fff"
                        opacity="0.8"
                     />
                     <rect
                        x="18"
                        y="22"
                        width="12"
                        height="2"
                        rx="1"
                        fill="#fff"
                        opacity="0.8"
                     />
                     <rect
                        x="18"
                        y="28"
                        width="14"
                        height="2"
                        rx="1"
                        fill="#fff"
                        opacity="0.8"
                     />

                     {/* Subtle Texture Effect */}
                     <rect
                        x="12"
                        y="8"
                        width="28"
                        height="36"
                        rx="2"
                        fill="url(#texture)"
                        opacity="0.2"
                     />

                     {/* Gradients */}
                     <defs>
                        <linearGradient
                           id="gradient1"
                           x1="0"
                           y1="0"
                           x2="1"
                           y2="1"
                        >
                           <stop offset="0%" stopColor="#EC4899" /> {/* Pink */}
                           <stop offset="100%" stopColor="#8B5CF6" />{" "}
                           {/* Purple */}
                        </linearGradient>
                        <linearGradient
                           id="gradient2"
                           x1="0"
                           y1="0"
                           x2="1"
                           y2="1"
                        >
                           <stop offset="0%" stopColor="#3B82F6" /> {/* Blue */}
                           <stop offset="100%" stopColor="#8B5CF6" />{" "}
                           {/* Purple */}
                        </linearGradient>

                        {/* Subtle Texture */}
                        <pattern
                           id="texture"
                           x="0"
                           y="0"
                           width="10"
                           height="10"
                           patternUnits="userSpaceOnUse"
                        >
                           <circle cx="1" cy="1" r="1" fill="#fff" />
                           <circle cx="6" cy="6" r="1" fill="#fff" />
                        </pattern>
                     </defs>
                  </svg>
                  <div className="flex flex-col">
                     <div
                        className={`font-[Calibri] text-2xl md:text-[2.3rem] pb-0 md:pb-2 font-extrabold bg-gradient-to-r from-purple-800  to-pink-800 p-[2px] animate-shine transition-all duration-300 bg-clip-text text-transparent`}
                     >
                        <span className="sm:inline font-light ">
                           ResumeOnFly
                        </span>
                     </div>
                     <div className="text-[0.6rem] md:text-xs text-black font-normal pl-1">
                        <span className="text-xs text-black font-normal">
                           prod by{" "}
                           <span className="font-bold"> CVtoSalary</span>
                        </span>{" "}
                     </div>
                  </div>
               </Link>

               {/* Desktop Navigation - Now only shows on lg screens and up */}
               <nav className="hidden lg:flex items-center lg:space-x-6">
                  {getNavigationItems().map((item) => (
                     <Link
                        key={item}
                        href={getNavigationUrl(item)}
                        className="text-slate-600 hover:text-indigo-600 font-normal text-sm transition-colors duration-200 hover:scale-105 transform"
                     >
                        {item}
                     </Link>
                  ))}
               </nav>

               {/* Mobile Navigation Menu */}
               {isMobileMenuOpen && (
                  <div className=" lg:hidden absolute top-full left-0 w-full bg-white shadow-lg">
                     <div className="px-4 py-2 border-t border-indigo-100">
                        {getNavigationItems().map((item) => (
                           <Link
                              key={item}
                              href={getNavigationUrl(item)}
                              className="block px-4 py-3 text-slate-700 hover:bg-indigo-50 rounded-lg"
                              onClick={() => setIsMobileMenuOpen(false)}
                           >
                              {item}
                           </Link>
                        ))}
                     </div>
                  </div>
               )}

               {/* User Section - Mobile Optimized */}
               {user && userQuota ? (
                  <div className="flex items-center gap-1 md:gap-4 relative">
                     {/* Profile Image */}
                     {user.picture ? (
                        <img
                           src={user.picture}
                           alt={user.name}
                           className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-indigo-200"
                        />
                     ) : (
                        <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs md:text-sm">
                           {user.name?.charAt(0)}
                        </div>
                     )}

                     {/* User Info - Hidden on Mobile */}
                     <div className="hidden lg:block text-sm">
                        <p className="text-slate-900 font-medium flex items-center">
                           <span className="truncate max-w-[120px]">
                              {user.name}
                           </span>
                           <span className="text-xs text-white px-2 py-1 ml-2 rounded-full bg-gradient-to-r from-purple-700 via-pink-800 to-purple-700 p-[2px] animate-shine">
                              {userQuota.subscription.type}
                           </span>
                        </p>
                     </div>

                     {/* Dropdown Trigger */}
                     <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="p-1 hover:bg-indigo-100 rounded-full"
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

                     {/* Dropdown Menu - Mobile Positioning */}
                     {isDropdownOpen && (
                        <div
                           ref={dropdownRef}
                           className="absolute right-0 top-full mt-1 md:mt-2 w-64 md:w-[22rem] bg-white rounded-lg shadow-lg border border-indigo-100 py-2 z-50"
                        >
                           <div className="px-4 py-2 border-b border-indigo-100">
                              <p className="text-xs md:text-sm text-indigo-600">
                                 Email: {user.email}
                              </p>
                           </div>
                           <div className="px-4 py-2 border-b border-indigo-100">
                              <p className="text-xs md:text-sm text-indigo-600">
                                 ID: {user.uid}
                              </p>
                           </div>

                           {/* Quick Links Section */}
                           <div className="px-4 py-3 border-b border-indigo-100">
                              <p className="text-sm font-medium text-indigo-900 mb-2">
                                 Quick Links
                              </p>
                              <div className="flex space-x-2">
                                 <Link
                                    href="/dashboard"
                                    className="flex-1 py-2 px-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-xs font-medium rounded-lg transition-all duration-200 text-center"
                                    onClick={() => setIsDropdownOpen(false)}
                                 >
                                    Dashboard
                                 </Link>
                                 <Link
                                    href="/userFormPage"
                                    className="flex-1 py-2 px-3 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-xs font-medium rounded-lg transition-all duration-200 text-center"
                                    onClick={() => setIsDropdownOpen(false)}
                                 >
                                    Master Resume
                                 </Link>
                              </div>
                           </div>

                           {/* Premium Section */}
                           <div className="px-4 py-3 border-b border-indigo-100">
                              {userQuota.subscription.type === "free" ? (
                                 <button
                                    onClick={handleUpgradeClick}
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
               ) : (
                  <div className="flex items-center gap-2 md:gap-2">
                     <Button
                        onClick={handleGetStarted}
                        variant="ghost"
                        className="hidden sm:flex sm:flex-col text-indigo-600 text-sm md:text-base px-2 md:px-4 py-1 md:py-2"
                     >
                        Sign In
                     </Button>
                     <Button
                        onClick={handleGetStarted}
                        className="text-xs text-white md:text-base px-2 md:px-4 py-0 md:py-2 bg-gradient-to-r from-purple-700 via-pink-800 to-purple-700 p-[2px] animate-shine transition-all duration-300"
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
