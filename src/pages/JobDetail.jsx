import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useToast } from '../lib/ToastContext.jsx';
import { JOB_STATUS, PAYMENT_STATUS, JOB_PIPELINE, formatNaira, formatDateTime } from '../lib/format.js';
import Shell from '../components/Shell.jsx';
import { Ticket, TicketRow, Badge, SkeletonCards, EmptyState } from '../components/ui.jsx';

const STAGE_LABEL = {
  accepted: 'Accepted', diagnosing: 'Diagnosing', in_progress: 'In progress',
  quality_check: 'Quality check', ready: 'Ready', completed: 'Completed',
};

export default function JobDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { toast, toastError } = useToast();
  const [job, setJob] = useState(null);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);

  const load = useCallback(() => {
    api.get(`/repair-jobs/${id}`).then(({ data }) => setJob(data)).catch((e) => setError(e.message));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function confirmCompletion() {
    if (!confirm('Confirm you are satisfied with the repair? This releases payment to the technician.')) return;
    setConfirming(true);
    try {
      await api.post(`/repair-jobs/${id}/confirm`, {});
      toast('Payment released — thanks for confirming!', 'success');
      load();
    } catch (err) {
      toastError(err);
    } finally {
      setConfirming(false);
    }
  }

  if (error) return <Shell title="Job tracking" back activePath={location.pathname}><EmptyState icon="⚠️" text={error} /></Shell>;
  if (!job) return <Shell title="Job tracking" back activePath={location.pathname}><SkeletonCards n={3} /></Shell>;

  const exception = ['on_hold', 'disputed', 'cancelled'].includes(job.status);
  const currentIdx = JOB_PIPELINE.indexOf(job.status);
  const needsPayment = job.payment?.status === 'unpaid';
  const canConfirm = job.status === 'completed' && !job.customerConfirmedAt;
  const isSettled = job.customerConfirmedAt || ['released', 'cash_settled'].includes(job.payment?.status);
  const req = job.repairRequestId || {};

  return (
    <Shell title="Job tracking" back activePath={location.pathname}>
      <Ticket>
        <TicketRow>
          <span className="font-mono text-ink-mute text-[11px]">#{job._id.slice(-6).toUpperCase()}</span>
          <Badge map={JOB_STATUS} value={job.status} />
        </TicketRow>
        <h2 className="font-display text-[17px] text-ink mt-2">{req.itemType || 'Repair job'}</h2>
        <TicketRow className="mt-2">
          <span className="font-mono font-bold text-ink">{formatNaira(job.price)}</span>
          <Badge map={PAYMENT_STATUS} value={job.payment?.status} />
        </TicketRow>
        <div className="mt-2.5 h-1.5 bg-steel-dim rounded-full overflow-hidden">
          <div className="h-full bg-brand transition-all" style={{ width: `${job.progress || 0}%` }} />
        </div>
      </Ticket>

      {needsPayment && (
        <Ticket noPerf className="bg-alert-bg border-alert">
          <div className="text-alert font-semibold text-[13px]">Payment required</div>
          <div className="text-ink-mute text-[13px] mt-0.5 mb-2.5">The technician can't start work until payment is made or you've chosen pay-on-delivery.</div>
          <Link to={`/payment/${job._id}`} className="btn-primary btn-sm inline-flex">Pay now</Link>
        </Ticket>
      )}

      {exception && (
        <Ticket noPerf className="bg-alert-bg border-alert">
          <div className="text-alert font-semibold text-[13px]">
            {job.status === 'on_hold' ? 'Job on hold' : job.status === 'disputed' ? 'Under dispute' : 'Job cancelled'}
          </div>
        </Ticket>
      )}

      {!exception && (
        <>
          <div className="text-sm font-semibold text-ink mt-5 mb-3">Progress</div>
          <div className="relative pl-7">
            <div className="absolute left-[9px] top-1 bottom-1 w-0.5 bg-line" />
            {JOB_PIPELINE.map((stage, i) => {
              const done = currentIdx > i || (currentIdx === i && stage === 'completed');
              const active = currentIdx === i && stage !== 'completed';
              const history = job.statusHistory?.filter((h) => h.status === stage).slice(-1)[0];
              return (
                <div key={stage} className="relative pb-5 last:pb-0">
                  <div className={`absolute -left-7 top-0 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[11px]
                    ${done ? 'bg-brand border-brand text-white' : active ? 'border-amber shadow-[0_0_0_3px_#EFD9B9] bg-paper' : 'border-line bg-paper'}`}>
                    {done ? '✓' : ''}
                  </div>
                  <div className={`font-semibold text-[13px] ${active ? 'text-amber' : 'text-ink'}`}>{STAGE_LABEL[stage]}</div>
                  {history && <div className="text-ink-mute text-xs mt-0.5">{formatDateTime(history.changedAt)}{history.note ? ` — ${history.note}` : ''}</div>}
                </div>
              );
            })}
          </div>
        </>
      )}

      {job.contact && (
        <Ticket noPerf className="flex items-center justify-between mt-5">
          <div>
            <div className="text-ink-mute text-xs">Technician</div>
            <div className="font-semibold text-ink text-sm">{job.contact.name}</div>
          </div>
          {job.contact.phone && <a href={`tel:${job.contact.phone}`} className="btn-outline btn-sm">📞 Call</a>}
        </Ticket>
      )}

      {(req.problemDescription || req.mediaUrls?.length > 0) && (
        <Ticket noPerf className="mt-3">
          <div className="font-semibold text-ink text-[13px] mb-1">Request details</div>
          {req.problemDescription && <div className="text-ink-mute text-[13px]">{req.problemDescription}</div>}
          {req.mediaUrls?.length > 0 && (
            <div className="grid grid-cols-3 gap-1.5 mt-2">
              {req.mediaUrls.map((u) => <img key={u} src={u} alt="" className="w-full aspect-square object-cover rounded-md" />)}
            </div>
          )}
        </Ticket>
      )}

      {canConfirm && (
        <button className="btn-amber mt-5" disabled={confirming} onClick={confirmCompletion}>
          {confirming ? 'Confirming…' : '✓ Confirm completion & release payment'}
        </button>
      )}

      {isSettled && (
        <div className="flex gap-2 mt-5">
          <Link to={`/warranty/${job._id}`} className="btn-outline flex-1">Warranty</Link>
          <Link to={`/review/${job._id}`} className="btn-primary flex-1">Leave a review</Link>
        </div>
      )}
    </Shell>
  );
}
