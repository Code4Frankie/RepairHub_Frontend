import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { api, ApiError } from '../lib/api.js';
import { useToast } from '../lib/ToastContext.jsx';
import Shell from '../components/Shell.jsx';
import { SkeletonCards, EmptyState, Chip } from '../components/ui.jsx';
import { Field, Textarea } from '../components/Field.jsx';

const TAGS = ['On time', 'Professional', 'Great communication', 'Fair price', 'Clean work', 'Would recommend'];

export default function Review() {
  const { jobId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [job, setJob] = useState(null);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [tags, setTags] = useState([]);
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/repair-jobs/${jobId}`).then(({ data }) => setJob(data)).catch((e) => setError(e.message));
  }, [jobId]);

  function toggleTag(tag) {
    setTags((t) => (t.includes(tag) ? t.filter((x) => x !== tag) : [...t, tag]));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    if (!rating) { setFormError('Please select a star rating'); return; }
    setSubmitting(true);
    try {
      await api.post('/reviews', { repairJobId: jobId, rating, tags, comment: comment.trim() || undefined });
      toast('Thanks for your review!', 'success');
      navigate(`/job/${jobId}`);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Could not submit review');
    } finally {
      setSubmitting(false);
    }
  }

  if (error) return <Shell title="Leave a review" back activePath={location.pathname}><EmptyState icon="⚠️" text={error} /></Shell>;
  if (!job) return <Shell title="Leave a review" back activePath={location.pathname}><SkeletonCards n={1} /></Shell>;

  return (
    <Shell title="Leave a review" back activePath={location.pathname}>
      <p className="text-ink-mute text-[13px] mb-4">How was your {job.repairRequestId?.itemType || 'repair'}?</p>

      <form onSubmit={handleSubmit}>
        <div className="flex gap-1.5 justify-center mb-5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n} type="button" className="text-3xl leading-none"
              onMouseEnter={() => setHoverRating(n)} onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(n)}
            >
              {(hoverRating || rating) >= n ? '⭐' : '☆'}
            </button>
          ))}
        </div>

        <Field label="What stood out? (optional)">
          <div className="flex gap-2 flex-wrap">
            {TAGS.map((t) => <Chip key={t} selected={tags.includes(t)} onClick={() => toggleTag(t)}>{t}</Chip>)}
          </div>
        </Field>

        <Field label={<>Comment <span className="text-ink-mute font-normal">(optional)</span></>}>
          <Textarea maxLength={1000} placeholder="Tell other customers about your experience…"
            value={comment} onChange={(e) => setComment(e.target.value)} />
        </Field>

        {formError && <div className="field-error mb-2.5">{formError}</div>}
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit review'}
        </button>
      </form>
    </Shell>
  );
}
