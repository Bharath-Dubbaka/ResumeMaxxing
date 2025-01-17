"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { QuotaService } from "../services/QuotaService";
import { UserDetailsService } from "../services/UserDetailsService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
   const [user, setUser] = useState(null);
   const [userQuota, setUserQuota] = useState(null);
   const [userDetails, setUserDetails] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
         if (firebaseUser) {
            try {
               console.log("Firebase User:", firebaseUser);
               const userData = {
                  email: firebaseUser.email || "",
                  name: firebaseUser.displayName || "",
                  picture: firebaseUser.photoURL || "",
                  uid: firebaseUser.uid,
               };

               const quota = await QuotaService.getUserQuota(firebaseUser.uid);
               const details = await UserDetailsService.getUserDetails(
                  firebaseUser.uid
               );

               console.log("User Quota:", quota);
               console.log("User Details:", details);

               setUser(userData);
               setUserQuota(quota);
               setUserDetails(details);
            } catch (err) {
               console.error("Error restoring auth state:", err);
            }
         } else {
            console.log("No user logged in");
            setUser(null);
            setUserQuota(null);
            setUserDetails(null);
         }
         setLoading(false);
      });

      return () => unsubscribe();
   }, []);

   return (
      <AuthContext.Provider value={{ user, userQuota, userDetails, loading }}>
         {children}
      </AuthContext.Provider>
   );
}

export const useAuth = () => useContext(AuthContext);
