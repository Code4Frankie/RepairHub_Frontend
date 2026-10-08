import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useToast } from '../lib/ToastContext.jsx';
import { formatNaira } from '../lib/format.js';
import Shell from '../components/Shell.jsx';
import { Ticket, TicketRow, SkeletonCards, EmptyState } from '../components/ui.jsx';

const METHODS = [
  { val: 'paystack', icon: '💳', label: 'Pay with card / bank transfer', hint: 'Secure checkout via Paystack — held in escrow until you confirm the repair.' },
  { val: 'wallet', icon: '👛', label: 'Pay from RepairHub wallet', hint: null },
  { val: 'cash', icon: '💵', label: 'Pay on delivery (cash)', hint: 'Settle with the technician in person when the job is done.' },
];

export default function Payment() {
  const { jobId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast, toastError } = useToast();

  const [job, setJob] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [error, setError] = useState('');
  const [method, setMethod] = useState('paystack');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/repair-jobs/${jobId}`).then(({ data }) => setJob(data)).catch((e) => setError(e.message));
    api.get('/wallets/me').then(({ data }) => setWallet(data)).catch(() => setWallet(null));
  }, [jobId]);

  async function handlePay() {
    setLoading(true);
    try {
      const { data, message } = await api.post('/transactions/pay', { repairJobId: jobId, method });
      if (method === 'paystack' && data.authorizationUrl) {
        window.location.href = data.authorizationUrl; // leaves the SPA — Paystack's hosted checkout
        return;
      }
      toast(message || 'Payment recorded', 'success');
      navigate(`/job/${jobId}`);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  }

  if (error) return <Shell title="Payment" back activePath={location.pathname}><EmptyState icon="⚠️" text={error} /></Shell>;
  if (!job) return <Shell title="Payment" back activePath={location.pathname}><SkeletonCards n={2} /></Shell>;

  if (job.payment?.status && job.payment.status !== 'unpaid') {
    return (
      <Shell title="Payment" back activePath={location.pathname}>
        <EmptyState icon="✓" text="This job has already been paid for." action={
          <button className="btn-primary btn-sm inline-flex" onClick={() => navigate(`/job/${jobId}`)}>View job</button>
        } />
      </Shell>
    );
  }

  const walletInsufficient = method === 'wallet' && wallet && wallet.balance < job.price;

  return (
    <Shell title="Payment" back activePath={location.pathname}>
      <Ticket noPerf>
        <TicketRow><span className="text-ink-mute text-[13px]">Repair</span><span className="text-[13px]">{job.repairRequestId?.itemType || 'Job'}</span></TicketRow>
        <TicketRow className="mt-2"><span className="font-semibold text-ink">Total due</span><span className="font-mono font-bold text-ink text-lg">{formatNaira(job.price)}</span></TicketRow>
      </Ticket>

      <div className="text-sm font-semibold text-ink mt-5 mb-2.5">Choose a payment method</div>
      {METHODS.map((m) => (
        <label key={m.val} className={`ticket flex items-start gap-3 cursor-pointer ${method === m.val ? 'outline outline-2 outline-brand' : ''}`}>
          <input type="radio" name="method" className="mt-1" checked={method === m.val} onChange={() => setMethod(m.val)} />
          <div className="flex-1">
            <div className="font-semibold text-ink text-sm">{m.icon} {m.label}</div>
            {m.val === 'wallet' && wallet && (
              <div className="text-ink-mute text-[13px] mt-0.5">
                Balance: {formatNaira(wallet.balance)}
                {walletInsufficient && <span className="text-alert"> — insufficient for this job</span>}
              </div>
            )}
            {m.hint && <div className="text-ink-mute text-[13px] mt-0.5">{m.hint}</div>}
          </div>
        </label>
      ))}

      <button className="btn-primary mt-3" disabled={loading || walletInsufficient} onClick={handlePay}>
        {loading ? 'Processing…' : method === 'paystack' ? 'Continue to checkout' : 'Confirm payment'}
      </button>
    </Shell>
  );
}
