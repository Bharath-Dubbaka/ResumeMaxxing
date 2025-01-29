// src/services/QuotaServices.tsx
import { db } from "../services/firebase";
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";

export class QuotaService {
   static DEFAULT_FREE_QUOTA = {
      downloads: { used: 0, limit: 10 },
      generates: { used: 0, limit: 10 },
      parsing: { used: 0, limit: 10 },
      subscription: {
         type: "free",
         startDate: new Date().toISOString(),
         endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
   };

   static DEFAULT_PREMIUM_QUOTA = {
      downloads: { used: 0, limit: 100 },
      generates: { used: 0, limit: 100 },
      parsing: { used: 0, limit: 100 },
      subscription: {
         type: "premium",
         startDate: new Date().toISOString(),
         endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
   };

   static async getUserQuota(uid) {
      const userRef = doc(db, "quotas", uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
         const defaultQuota = this.DEFAULT_FREE_QUOTA;
         await setDoc(userRef, defaultQuota);
         return defaultQuota;
      }

      const data = docSnap.data();
      const quota = {
         downloads: data.downloads,
         generates: data.generates,
         parsing: data.parsing,
         subscription: {
            type: data.subscription.type,
            startDate: data.subscription.startDate,
            endDate: data.subscription.endDate,
         },
      };

      if (await this.shouldRefreshQuota(quota)) {
         return await this.refreshQuota(uid, quota);
      }

      return quota;
   }

   static async shouldRefreshQuota(quota) {
      if (!quota?.subscription?.endDate) return true;
      const currentDate = new Date();
      const endDate = new Date(quota.subscription.endDate);
      return currentDate > endDate;
   }

   static async refreshQuota(uid, currentQuota) {
      const userRef = doc(db, "quotas", uid);
      const currentDate = new Date();

      // Add null check and default to expired if no valid subscription
      const hasExpired =
         !currentQuota?.subscription?.endDate ||
         new Date(currentQuota.subscription.endDate) < currentDate;

      const newQuota = hasExpired
         ? {
              ...this.DEFAULT_FREE_QUOTA,
              subscription: {
                 type: "free",
                 startDate: currentDate.toISOString(),
                 endDate: new Date(
                    currentDate.getTime() + 30 * 24 * 60 * 60 * 1000
                 ).toISOString(),
              },
           }
         : {
              ...currentQuota,
              downloads: { ...currentQuota.downloads, used: 0 },
              generates: { ...currentQuota.generates, used: 0 },
              parsing: { ...currentQuota.parsing, used: 0 },
              subscription: {
                 ...currentQuota.subscription,
                 startDate: currentDate.toISOString(),
                 endDate: new Date(
                    currentDate.getTime() + 30 * 24 * 60 * 60 * 1000
                 ).toISOString(),
              },
           };

      await setDoc(userRef, newQuota);
      return newQuota;
   }

   static async checkQuota(uid, type) {
      const quota = await this.getUserQuota(uid);
      return quota[type].used < quota[type].limit;
   }

   static async incrementUsage(uid, type) {
      const userRef = doc(db, "quotas", uid);
      const quota = await this.getUserQuota(uid);

      // Check if quota needs refresh before incrementing
      if (await this.shouldRefreshQuota(quota)) {
         await this.refreshQuota(uid, quota);
         return;
      }

      quota[type].used += 1;
      await updateDoc(userRef, {
         [`${type}.used`]: quota[type].used,
      });
   }

   static async upgradeToPremium(uid) {
      const userRef = doc(db, "quotas", uid);
      const currentDate = new Date();

      const premiumQuota = {
         ...this.DEFAULT_PREMIUM_QUOTA,
         subscription: {
            type: "premium",
            startDate: currentDate.toISOString(),
            endDate: new Date(
               currentDate.getTime() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
         },
      };

      await setDoc(userRef, premiumQuota);
      return premiumQuota; // Return the new quota
   }

   static listenToUserQuota(uid, callback) {
      const userRef = doc(db, "quotas", uid);
      return onSnapshot(userRef, (doc) => {
         if (doc.exists()) {
            const data = doc.data();
            callback(data);
         } else {
            console.error("No such document!");
         }
      });
   }
}
