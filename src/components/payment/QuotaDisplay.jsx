'use client';

import { CrownIcon } from 'lucide-react';
import { PaymentButton } from './PaymentButton';

export function QuotaDisplay({ userQuota, userId, onUpgradeSuccess }) {
  if (!userQuota) return null;

  const isPremium = userQuota?.subscription?.type === 'premium';
  const remainingQuota = userQuota?.remainingQuota || 0;

  return (
    <div className="flex flex-col gap-4 p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Your Quota</h3>
        {isPremium && (
          <div className="flex items-center gap-2 text-yellow-500">
            <CrownIcon size={16} />
            <span className="text-sm font-medium">Premium Member</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Remaining Credits</span>
          <span className="font-medium">
            {isPremium ? 'Unlimited' : remainingQuota}
          </span>
        </div>

        {!isPremium && (
          <div className="mt-4">
            <PaymentButton userId={userId} onSuccess={onUpgradeSuccess} />
            <p className="mt-2 text-sm text-muted-foreground">
              Upgrade to Premium for unlimited credits - Just ₹100
            </p>
          </div>
        )}
      </div>
    </div>
  );
}