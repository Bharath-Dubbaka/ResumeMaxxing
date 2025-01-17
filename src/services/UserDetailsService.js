// src/services/UserDetailsServices.tsx

import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export class UserDetailsService {
   static async getUserDetails(uid) {
      const userRef = doc(db, "userDetails", uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
         return null;
      }

      return docSnap.data();
   }

   static async saveUserDetails(uid, details) {
      const userRef = doc(db, "userDetails", uid);
      await setDoc(userRef, details);
      return details;
   }
}
