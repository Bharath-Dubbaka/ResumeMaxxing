// src/services/UserDetailsServices.tsx

import { db } from "../services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export class UserDetailsService {
   static async getUserDetails(uid) {
      try {
         if (!uid) return null;

         const userRef = doc(db, "userDetails", uid);
         const docSnap = await getDoc(userRef);

         if (!docSnap.exists()) {
            return null;
         }

         return docSnap.data();
      } catch (error) {
         console.error("Error getting user details:", error);
         throw error;
      }
   }

   static async saveUserDetails(uid, details) {
      try {
         if (!uid || !details) {
            throw new Error("Missing required parameters");
         }

         console.log("Saving details for uid:", uid);

         const userRef = doc(db, "userDetails", uid);
         const updatedDetails = {
            ...details,
            updatedAt: new Date().toISOString(),
         };

         await setDoc(userRef, updatedDetails);
         console.log("Details saved successfully");

         return updatedDetails;
      } catch (error) {
         console.error("Error saving user details:", error);
         throw error;
      }
   }
}
