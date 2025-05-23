import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
// Export Firestore instance
export const firestore = getFirestore(app);

// Modified error handling function that checks auth state first
async function fetchDataWithErrorHandling() {
   // Only proceed if user is authenticated
   if (!auth.currentUser) {
      console.log("No authenticated user, skipping data fetch");
      return;
   }

   try {
      const docRef = doc(db, "your-collection", "document-id");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
         console.log("Document data:", docSnap.data());
      } else {
         console.log("No such document!");
      }
   } catch (error) {
      if (error.code === "permission-denied") {
         console.log(
            "Permission denied. User may not be properly authenticated."
         );
         return;
      }
      console.error("Error fetching document:", error);
   }
}

// Don't call fetchDataWithErrorHandling immediately
// Instead, export it to be called after authentication
export { fetchDataWithErrorHandling };
