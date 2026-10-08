import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useToast } from '../lib/ToastContext.jsx';
import { REQUEST_STATUS, QUOTE_STATUS, formatDate, formatNaira } from '../lib/format.js';
import Shell from '../components/Shell.jsx';
import { Ticket, TicketRow, Badge, Chip, SectionTitle, SkeletonCards, EmptyState } from '../components/ui.jsx';

const SORTS = [
  { val: 'price', label: 'Lowest price' },
  { val: 'rating', label: 'Highest rated' },
  { val: 'eta', label: 'Fastest' },
  { val: 'value', label: 'Best value' },
];

export default function RequestDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast, toastError } = useToast();

  const [request, setRequest] = useState(null);
  const [error, setError] = useState('');
  const [sort, setSort] = useState('price');
  const [quotes, setQuotes] = useState(null);
  const [quotesError, setQuotesError] = useState('');
  const [jobId, setJobId] = useState(null);
  const [acceptingId, setAcceptingId] = useState(null);

  const loadRequest = useCallback(() => {
    api.get(`/repair-requests/${id}`).then(({ data }) => setRequest(data)).catch((e) => setError(e.message));
  }, [id]);

  useEffect(() => { loadRequest(); }, [loadRequest]);

  const canCompare = request && ['open', 'quoted'].includes(request.status);
  const isClosed = request && ['booked', 'in_progress', 'completed'].includes(request.status);

  useEffect(() => {
    if (!canCompare) return;
    setQuotes(null);
    setQuotesError('');
    api.get(`/quotations/repair-request/${id}`, { sort })
      .then(({ data }) => setQuotes(data))
      .catch((e) => setQuotesError(e.message));
  }, [id, sort, canCompare]);

  useEffect(() => {
    if (!isClosed) return;
    api.get('/repair-jobs', { limit: 100 }).then(({ data }) => {
      const job = data.find((j) => (j.repairRequestId?._id || j.repairRequestId) === request._id);
      if (job) setJobId(job._id);
    }).catch(() => {});
  }, [isClosed, request]);

  async function cancelRequest() {
    if (!confirm('Cancel this repair request?')) return;
    try {
      await api.patch(`/repair-requests/${id}/cancel`, {});
      toast('Request cancelled', 'success');
      loadRequest();
    } catch (err) { toastError(err); }
  }

  async function acceptQuote(quoteId) {
    if (!confirm('Accept this quotation? Other quotes for this request will be rejected.')) return;
    setAcceptingId(quoteId);
    try {
      const { data: accepted } = await api.patch(`/quotations/${quoteId}/accept`, {});
      toast('Quotation accepted', 'success');
      navigate(`/booking/${accepted._id}`);
    } catch (err) {
      toastError(err);
      setAcceptingId(null);
    }
  }

  return (
    <Shell title="Repair request" back activePath={location.pathname}>
      {error && <EmptyState icon="⚠️" text={error} />}
      {!request && !error && <SkeletonCards n={3} />}

      {request && (
        <>
          <Ticket>
            <TicketRow>
              <span className="font-mono text-ink-mute text-[11px]">#{request._id.slice(-6).toUpperCase()}</span>
              <Badge map={REQUEST_STATUS} value={request.status} />
            </TicketRow>
            <h2 className="font-display text-[17px] text-ink mt-2">{request.itemType}</h2>
            {request.brandModel && <div className="text-ink-mute text-[13px]">{request.brandModel}</div>}
            <div className="border-t border-line my-3.5" />
            <div className="text-ink-mute text-[13px]">{request.problemDescription}</div>
            {request.mediaUrls?.length > 0 && (
              <div className="grid grid-cols-3 gap-1.5 mt-2.5">
                {request.mediaUrls.map((u) => <img key={u} src={u} alt="" className="w-full aspect-square object-cover rounded-md" />)}
              </div>
            )}
            <div className="border-t border-line my-3.5" />
            <TicketRow><span className="text-ink-mute text-[13px]">Category</span><span className="text-[13px]">{request.serviceCategoryId?.name || '—'}</span></TicketRow>
            <TicketRow className="mt-1.5"><span className="text-ink-mute text-[13px]">Urgency</span><span className="text-[13px] capitalize">{request.urgency}</span></TicketRow>
            <TicketRow className="mt-1.5"><span className="text-ink-mute text-[13px]">Submitted</span><span className="text-[13px]">{formatDate(request.createdAt)}</span></TicketRow>
          </Ticket>

          {request.status === 'open' && (
            <button className="btn-outline" onClick={cancelRequest}>Cancel request</button>
          )}

          {isClosed && jobId && (
            <Link to={`/job/${jobId}`} className="btn-primary inline-flex">View job &amp; tracking →</Link>
          )}

          {canCompare && (
            <>
              <SectionTitle>Quotations</SectionTitle>
              <div className="flex gap-2 flex-wrap mb-2.5">
                {SORTS.map((s) => (
                  <Chip key={s.val} selected={sort === s.val} onClick={() => setSort(s.val)}>{s.label}</Chip>
                ))}
              </div>

              {!quotes && !quotesError && <SkeletonCards n={2} />}
              {quotesError && <EmptyState icon="⚠️" text={quotesError} />}
              {quotes && (
                quotes.length ? quotes.map((q) => (
                  <Ticket key={q._id}>
                    <TicketRow>
                      <span className="font-mono font-bold text-ink text-base">{formatNaira(q.price)}</span>
                      {q.bestValue ? <span className="badge-success">Best value</span> : <Badge map={QUOTE_STATUS} value={q.status} />}
                    </TicketRow>
                    <TicketRow className="mt-1.5">
                      <span className="text-[13px]">{q.technicianId?.userId?.fullName || q.serviceCenterId?.businessName || 'Provider'}</span>
                      <span className="text-ink-mute text-[13px]">⭐ {(q.technicianId?.ratingAvg || 0).toFixed(1)}</span>
                    </TicketRow>
                    <div className="text-ink-mute text-[13px] mt-1">
                      {q.estimatedDays ? `${q.estimatedDays} day${q.estimatedDays === 1 ? '' : 's'}` : 'ETA n/a'} · {q.warrantyDays || 30} day warranty
                    </div>
                    {q.notes && <div className="text-ink-mute text-[13px] mt-1.5">{q.notes}</div>}
                    {q.status === 'pending' && (
                      <button
                        className="btn-amber btn-sm mt-2.5"
                        disabled={acceptingId === q._id}
                        onClick={() => acceptQuote(q._id)}
                      >
                        {acceptingId === q._id ? 'Accepting…' : 'Accept this quote'}
                      </button>
                    )}
                  </Ticket>
                )) : <EmptyState icon="📭" text="No quotations yet — technicians will respond soon" />
              )}
            </>
          )}
        </>
      )}
    </Shell>
  );
}
