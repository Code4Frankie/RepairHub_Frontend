import React, { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { timeAgo } from '../lib/format.js';
import Shell from '../components/Shell.jsx';
import { Ticket, Avatar, Stamp, Chip, SectionTitle, SkeletonCards, EmptyState } from '../components/ui.jsx';

export default function Technician() {
  const { id } = useParams();
  const location = useLocation();
  const [tech, setTech] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/technician-profiles/${id}`).then(({ data }) => setTech(data)).catch((e) => setError(e.message));
    api.get(`/reviews/technician/${id}`).then(({ data }) => setReviews(data)).catch(() => setReviews([]));
  }, [id]);

  return (
    <Shell title="Technician profile" back activePath={location.pathname}>
      {error && <EmptyState icon="⚠️" text={error} />}
      {!tech && !error && <SkeletonCards n={3} />}
      {tech && (
        <>
          <Ticket noPerf className="text-center">
            <Avatar name={tech.userId?.fullName} size={64} />
            <div className="mx-auto" />
            <h2 className="font-display text-[18px] text-ink mt-2.5">{tech.userId?.fullName || 'Technician'}</h2>
            <div className="my-1.5"><Stamp /></div>
            <div className="text-ink-mute text-[13px]">
              ⭐ {(tech.ratingAvg || 0).toFixed(1)} ({tech.ratingCount || 0} reviews) · {tech.jobsCompleted || 0} jobs completed
            </div>
            {tech.experienceYears ? <div className="text-ink-mute text-[13px]">{tech.experienceYears} years experience</div> : null}
          </Ticket>

          {tech.bio && (
            <Ticket noPerf>
              <div className="font-semibold text-ink text-[13px] mb-1">About</div>
              <div className="text-ink-mute text-[13px]">{tech.bio}</div>
            </Ticket>
          )}

          {tech.serviceAreas?.length > 0 && (
            <Ticket noPerf>
              <div className="font-semibold text-ink text-[13px] mb-1.5">Service areas</div>
              <div className="flex gap-2 flex-wrap">
                {tech.serviceAreas.map((a) => <Chip key={a}>{a}</Chip>)}
              </div>
            </Ticket>
          )}

          <SectionTitle>Reviews</SectionTitle>
          {!reviews && <SkeletonCards n={2} />}
          {reviews && (
            reviews.length ? reviews.map((r) => (
              <Ticket key={r._id}>
                <div className="flex justify-between items-baseline">
                  <span>{'⭐'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  <span className="text-ink-mute font-mono text-[11px]">{timeAgo(r.createdAt)}</span>
                </div>
                {r.comment && <div className="text-ink-mute text-[13px] mt-1.5">{r.comment}</div>}
                {r.tags?.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mt-2">
                    {r.tags.map((tag) => <span key={tag} className="chip px-2.5 py-1 text-[11px]">{tag}</span>)}
                  </div>
                )}
              </Ticket>
            )) : <EmptyState icon="💬" text="No reviews yet" />
          )}

          <Link to={`/request-new?technicianId=${tech._id}`} className="btn-primary mt-4 inline-flex">
            Request a repair
          </Link>
        </>
      )}
    </Shell>
  );
}
