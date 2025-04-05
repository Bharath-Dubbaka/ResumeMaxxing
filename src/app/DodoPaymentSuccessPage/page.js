'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { Loader2 } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { QuotaService } from '../../services/QuotaService';
import { setUserQuota } from '../../store/slices/firebaseSlice';

export default function DodoPaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    const userId = searchParams.get('userId');
    const paymentId = searchParams.get('payment_id');
    
    if (paymentId) {
      const verifyAndUpdateUser = async () => {
        try {
          // First verify the payment
          const verifyResponse = await fetch('/api/payment/verify-dodo-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              paymentId,
              userId: userId || user.uid 
            }),
          });
          
          const data = await verifyResponse.json();
          
          if (data.success) {
            try {
              // Update Firestore directly from client side
              const userRef = doc(db, 'quotas', user.uid);
              await updateDoc(userRef, {
                'downloads.limit': 100,
                'downloads.used': 0,
                'generates.limit': 100, 
                'generates.used': 0, 
                'parsing.limit': 100,
                'parsing.used': 0,
                'subscription.type': 'premium',
                'subscription.startDate': new Date().toISOString(),
                'subscription.endDate': new Date(
                  Date.now() + 30 * 24 * 60 * 60 * 1000
                ).toISOString(),
              });
              
              // Update Redux state
              const quota = await QuotaService.getUserQuota(user.uid);
              dispatch(setUserQuota(quota));
              
              // Redirect to dashboard after 3 seconds
              setTimeout(() => {
                router.push('/dashboard');
              }, 3000);
            } catch (updateError) {
              console.error('Error updating user data:', updateError);
              setTimeout(() => {
                router.push('/dashboard');
              }, 3000);
            }
          } else {
            console.error('Payment verification failed:', data.error);
            setTimeout(() => {
              router.push('/dashboard');
            }, 3000);
          }
        } catch (error) {
          console.error('Error verifying payment:', error);
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
        }
      };

      verifyAndUpdateUser();
    } else {
      router.push('/dashboard');
    }
  }, [user, router, dispatch, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200/60 via-pink-50/95 to-blue-200/60">
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-4">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold text-green-600">Payment Successful!</h1>
        <p className="text-gray-600">Thank you for upgrading to Premium.</p>
        <p className="text-sm text-gray-500">Redirecting you to dashboard...</p>
      </div>
    </div>
  );
}