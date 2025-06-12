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
      const idToken = await result.user.getIdToken();

      localStorage.setItem("firebaseToken", idToken);

      // Set Redux user info
      const userData = {
         email: result.user.email,
         name: result.user.displayName,
         picture: result.user.photoURL,
         uid: result.user.uid,
      };
      dispatch(setUser(userData));

      // Fetch userDetails and quota from Express backend
      const [quota, details] = await Promise.all([
         QuotaService.getUserQuota(),
         UserDetailsService.getUserDetails(),
      ]);

      dispatch(setUserQuota(quota));
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

         router.push(details ? "/dashboard" : "/userFormPage");
      } catch (error) {
         console.error("Auth flow error:", error);
         throw error;
      }
   }
}

export default AuthService;
