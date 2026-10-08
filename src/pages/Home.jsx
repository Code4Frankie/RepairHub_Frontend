import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useAuth } from '../lib/AuthContext.jsx';
import { iconForCategory } from '../lib/format.js';
import Shell from '../components/Shell.jsx';
import { Ticket, Avatar, Stamp, SectionTitle, SkeletonCards, EmptyState } from '../components/ui.jsx';

export default function Home() {
  const { user } = useAuth();
  const location = useLocation();
  const [categories, setCategories] = useState(null);
  const [catError, setCatError] = useState('');
  const [techs, setTechs] = useState(null);
  const [techError, setTechError] = useState('');

  useEffect(() => {
    api.get('/service-categories').then(({ data }) => setCategories(data)).catch((e) => setCatError(e.message));
    api.get('/technician-profiles', { sort: 'rating', limit: 5 }).then(({ data }) => setTechs(data)).catch((e) => setTechError(e.message));
  }, []);

  return (
    <Shell title="RepairHub" activePath={location.pathname} actionIcon="🔔" actionHref="/notifications">
      <p className="text-ink-mute text-[13px] mb-0.5">Hi, {user?.fullName?.split(' ')[0]} 👋</p>
      <h2 className="font-display text-[20px] text-ink font-semibold mb-4">What needs fixing today?</h2>

      <Link to="/request-new" className="btn-primary mb-5 inline-flex">+ New repair request</Link>

      <SectionTitle>Categories</SectionTitle>
      {!categories && !catError && <SkeletonCards n={2} />}
      {catError && <EmptyState icon="⚠️" text={catError} />}
      {categories && (
        categories.length ? (
          <div className="grid grid-cols-2 gap-2">
            {categories.map((c) => (
              <Link key={c._id} to={`/search?categoryId=${c._id}`} className="category-chip flex items-center gap-2.5 p-3 border border-line rounded-[7px] bg-paper">
                <span className="w-[34px] h-[34px] rounded-md bg-steel flex items-center justify-center text-base flex-shrink-0">{iconForCategory(c.name)}</span>
                <span className="text-[13px] font-semibold text-ink">{c.name}</span>
              </Link>
            ))}
          </div>
        ) : <EmptyState icon="🗂️" text="No categories available yet" />
      )}

      <SectionTitle>Top-rated technicians near you</SectionTitle>
      {!techs && !techError && <SkeletonCards n={2} />}
      {techError && <EmptyState icon="⚠️" text={techError} />}
      {techs && (
        techs.length ? techs.map((t) => (
          <Link key={t._id} to={`/technician/${t._id}`}>
            <Ticket noPerf className="flex items-center gap-3">
              <Avatar name={t.userId?.fullName} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-ink text-sm">{t.userId?.fullName || 'Technician'}</div>
                <div className="text-ink-mute text-[13px]">⭐ {(t.ratingAvg || 0).toFixed(1)} ({t.ratingCount || 0}) · {t.jobsCompleted || 0} jobs</div>
              </div>
              <Stamp />
            </Ticket>
          </Link>
        )) : <EmptyState icon="🔧" text="No verified technicians yet — check back soon" />
      )}
    </Shell>
  );
}
