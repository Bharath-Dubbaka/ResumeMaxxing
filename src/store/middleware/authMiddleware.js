import { auth } from "../../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { setUser, setLoading } from "../slices/authSlice";
import { setUserDetails, setUserQuota } from "../slices/firebaseSlice";
import { QuotaService } from "../../services/QuotaService";
import { UserDetailsService } from "../../services/UserDetailsService";

export const createAuthMiddleware = (store) => {
   onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
         try {
            const userData = {
               email: firebaseUser.email || "",
               name: firebaseUser.displayName || "",
               picture: firebaseUser.photoURL || "",
               uid: firebaseUser.uid,
            };

            store.dispatch(setUser(userData));

            const quota = await QuotaService.getUserQuota(firebaseUser.uid);
            const details = await UserDetailsService.getUserDetails(
               firebaseUser.uid
            );

            store.dispatch(setUserQuota(quota));
            store.dispatch(setUserDetails(details));
         } catch (error) {
            console.error("Error restoring auth state:", error);
         }
      } else {
         store.dispatch(setUser(null));
      }
      store.dispatch(setLoading(false));
   });

   return (next) => (action) => {
      return next(action);
   };
};
