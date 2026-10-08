import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { api, ApiError } from '../lib/api.js';
import { useToast } from '../lib/ToastContext.jsx';
import { formatDate } from '../lib/format.js';
import Shell from '../components/Shell.jsx';
import { Ticket, TicketRow, SkeletonCards, EmptyState } from '../components/ui.jsx';
import { Field, Textarea } from '../components/Field.jsx';

export default function Warranty() {
  const { jobId } = useParams();
  const location = useLocation();
  const { toast, toastError } = useToast();

  const [warranty, setWarranty] = useState(null);
  const [error, setError] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(() => {
    api.get(`/warranty-records/job/${jobId}`).then(({ data }) => setWarranty(data)).catch((e) => setError(e.message));
  }, [jobId]);

  useEffect(() => { load(); }, [load]);

  const expired = warranty && new Date() > new Date(warranty.expiresAt);
  const openClaim = warranty?.claims?.find((c) => c.status === 'open');

  async function fileClaim(e) {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await api.post(`/warranty-records/${warranty._id}/claims`, { description: description.trim() });
      toast('Warranty claim filed', 'success');
      setDescription('');
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Could not file claim');
    } finally {
      setSubmitting(false);
    }
  }

  if (error) return <Shell title="Warranty" back activePath={location.pathname}><EmptyState icon="⚠️" text={error} /></Shell>;
  if (!warranty) return <Shell title="Warranty" back activePath={location.pathname}><SkeletonCards n={2} /></Shell>;

  return (
    <Shell title="Warranty" back activePath={location.pathname}>
      <Ticket noPerf className="text-center">
        <div className="text-3xl mb-1.5">🛡️</div>
        <div className="font-display text-ink text-lg">{warranty.durationDays}-day warranty</div>
        <div className={`text-[13px] mt-1 ${expired ? 'text-alert' : 'text-success'}`}>
          {expired ? 'Expired' : 'Active'} · expires {formatDate(warranty.expiresAt)}
        </div>
      </Ticket>

      <Ticket noPerf>
        <div className="font-semibold text-ink text-[13px] mb-1">Coverage terms</div>
        <div className="text-ink-mute text-[13px]">{warranty.terms}</div>
      </Ticket>

      {warranty.claims?.length > 0 && (
        <>
          <div className="text-sm font-semibold text-ink mt-5 mb-2.5">Claim history</div>
          {warranty.claims.map((c, i) => (
            <Ticket key={i}>
              <TicketRow>
                <span className={`text-[13px] font-semibold ${c.status === 'open' ? 'text-amber' : c.status === 'resolved' ? 'text-success' : 'text-alert'}`}>
                  {c.status === 'open' ? 'Pending review' : c.status === 'resolved' ? 'Resolved' : 'Rejected'}
                </span>
                <span className="text-ink-mute text-xs">{formatDate(c.createdAt)}</span>
              </TicketRow>
              <div className="text-ink-mute text-[13px] mt-1.5">{c.description}</div>
              {c.resolutionNote && <div className="text-ink-mute text-[13px] mt-1.5 italic">"{c.resolutionNote}"</div>}
            </Ticket>
          ))}
        </>
      )}

      {!expired && !openClaim && (
        <>
          <div className="text-sm font-semibold text-ink mt-5 mb-2.5">File a claim</div>
          <form onSubmit={fileClaim}>
            <Field hint="At least 5 characters — describe what's recurring or still wrong.">
              <Textarea required minLength={5} maxLength={1000} placeholder="The screen flickers again after a week…"
                value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>
            {formError && <div className="field-error mb-2.5">{formError}</div>}
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Filing…' : 'File claim'}
            </button>
          </form>
        </>
      )}

      {openClaim && (
        <Ticket noPerf className="mt-5 bg-amber-dim border-amber">
          <div className="text-[13px] text-ink">You have an open claim being reviewed — you can file a new one once it's resolved.</div>
        </Ticket>
      )}
    </Shell>
  );
}
