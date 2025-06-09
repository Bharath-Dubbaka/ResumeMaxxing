// :::Single Source of Truth:::
// All authentication logic is in one place
// Easier to maintain and update
// Consistent behavior across components
// Shared authentication state using Redux

import { auth } from "./firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { QuotaService } from "./QuotaService";
import { UserDetailsService } from "./UserDetailsService";

class AuthService {
   static async signInWithGoogle(
      dispatch,
      setUser,
      setUserQuota,
      setUserDetails
   ) {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Get the ID token here
      const idToken = await result.user.getIdToken();
      console.log("Firebase ID Token:", idToken); // <-- Send this to your backend

      // Optional: Store or send to backend
      localStorage.setItem("firebaseToken", idToken); // You can read this from Postman too

      // Send to backend (optional, for example)
      await fetch("http://localhost:9999/", {
         headers: {
            Authorization: `Bearer ${idToken}`,
         },
      });

      // Update user data
      const userData = {
         email: result.user.email,
         name: result.user.displayName,
         picture: result.user.photoURL,
         uid: result.user.uid,
      };
      dispatch(setUser(userData));

      // Get and update quota
      const quota = await QuotaService.getUserQuota(result.user.uid);
      dispatch(setUserQuota(quota));

      // Get and update user details
      const details = await UserDetailsService.getUserDetails(result.user.uid);
      dispatch(setUserDetails(details));

      return { userData, details };
   }

   static async signOut(dispatch, logout, clearFirebaseData) {
      try {
         await auth.signOut();
         dispatch(logout());
         dispatch(clearFirebaseData());
         return true;
      } catch (error) {
         console.error("Logout error:", error);
         return false;
      }
   }

   static async handleAuthFlow(dispatch, router, user, userDetails, actions) {
      try {
         if (user) {
            if (userDetails) {
               router.push("/dashboard");
            } else {
               router.push("/userFormPage");
            }
            return;
         }

         const { details } = await this.signInWithGoogle(
            dispatch,
            actions.setUser,
            actions.setUserQuota,
            actions.setUserDetails
         );

         if (details) {
            router.push("/dashboard");
         } else {
            router.push("/userFormPage");
         }
      } catch (error) {
         console.error("Auth flow error:", error);
         throw error;
      }
   }
}

export default AuthService;
