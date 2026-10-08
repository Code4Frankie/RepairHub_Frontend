import React, { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { formatNaira } from '../lib/format.js';
import Shell from '../components/Shell.jsx';
import { EmptyState, SkeletonCards } from '../components/ui.jsx';

// Where Paystack sends the browser back to after hosted checkout (configured server-side
// as PAYSTACK_CALLBACK_URL — point it at <your-deployed-frontend>/payment/callback).
// Paystack appends the reference as either `reference` or `trxref`.
export default function PaymentCallback() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const [txn, setTxn] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!reference) { setError('No payment reference found in the URL.'); return; }
    api.get(`/transactions/verify/${reference}`).then(({ data }) => setTxn(data)).catch((e) => setError(e.message));
  }, [reference]);

  return (
    <Shell title="Payment status" back activePath={location.pathname} showNav={false}>
      {error && <EmptyState icon="⚠️" text={error} />}
      {!txn && !error && <SkeletonCards n={1} />}
      {txn && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">
            {txn.status === 'success' ? '✅' : txn.status === 'pending' ? '⏳' : '❌'}
          </div>
          <h2 className="font-display text-ink text-lg mb-1">
            {txn.status === 'success' ? 'Payment successful' : txn.status === 'pending' ? 'Payment pending' : 'Payment failed'}
          </h2>
          <p className="text-ink-mute text-[13px] mb-5">{formatNaira(txn.amount)} · ref {txn.reference}</p>
          <Link to={`/job/${txn.repairJobId}`} className="btn-primary inline-flex">View job</Link>
        </div>
      )}
    </Shell>
  );
}
