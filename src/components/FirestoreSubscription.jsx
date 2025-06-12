"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUserQuota } from "../store/slices/firebaseSlice";
import { QuotaService } from "../services/QuotaService";

const FirestoreSubscription = () => {
   const dispatch = useDispatch();
   const { user } = useSelector((state) => state.auth);

   // useEffect(() => {
   //    let unsubscribe;

   //    if (user?.uid) {
   //       unsubscribe = QuotaService.listenToUserQuota(user.uid, (quota) => {
   //          console.log("Quota updated:", quota); // Debug log
   //          dispatch(setUserQuota(quota));
   //       });
   //    }

   //    return () => {
   //       if (unsubscribe) {
   //          unsubscribe();
   //       }
   //    };
   // }, [user, dispatch]);

   return null; // This component doesn't render anything
};

export default FirestoreSubscription;
