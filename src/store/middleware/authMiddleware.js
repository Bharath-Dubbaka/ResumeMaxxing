import { auth } from "../../services/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { setUser, setLoading } from "../slices/authSlice";
import { setUserDetails, setUserQuota } from "../slices/firebaseSlice";
import { QuotaService } from "../../services/QuotaService";
import { UserDetailsService } from "../../services/UserDetailsService";

export const createAuthMiddleware = (store) => {
   onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
         const token = await firebaseUser.getIdToken();
         //test API call for development only logs for token of user from firebase
         console.log("Your Firebase Token:", token);

         try {
            //test API call for development only logs for token of user from firebase
            // const response = await fetch("http://localhost:9999/", {
            //    headers: {
            //       Authorization: `Bearer ${token}`,
            //       "Content-Type": "application/json",
            //    },
            // });
            // const data = await response.json();
            // console.log("API Response:", data);
            const userData = {
               email: firebaseUser.email || "",
               name: firebaseUser.displayName || "",
               picture: firebaseUser.photoURL || "",
               uid: firebaseUser.uid,
            };

            store.dispatch(setUser(userData));

            // Fetch from Express backend
            const [quota, details] = await Promise.all([
               QuotaService.getUserQuota(),
               UserDetailsService.getUserDetails(),
            ]);

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

   return (next) => (action) => next(action);
};
