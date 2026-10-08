import React, { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import Shell from '../components/Shell.jsx';
import { Ticket, Avatar, Stamp, Chip, SkeletonCards, EmptyState } from '../components/ui.jsx';

const SORTS = [
  { val: 'rating', label: 'Top rated' },
  { val: 'jobs', label: 'Most jobs' },
  { val: 'newest', label: 'Newest' },
];

export default function Search() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(searchParams.get('categoryId') || '');
  const [sort, setSort] = useState('rating');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/service-categories').then(({ data }) => setCategories(data)).catch(() => {});
  }, []);

  useEffect(() => {
    setResults(null);
    setError('');
    api.get('/technician-profiles', { serviceCategoryId: categoryId || undefined, sort, limit: 30 })
      .then(({ data }) => setResults(data))
      .catch((e) => setError(e.message));
  }, [categoryId, sort]);

  return (
    <Shell title="Find a technician" back activePath={location.pathname}>
      <select
        className="field-input mb-2.5"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
      >
        <option value="">All categories</option>
        {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
      </select>

      <div className="flex gap-2 flex-wrap mb-4">
        {SORTS.map((s) => (
          <Chip key={s.val} selected={sort === s.val} onClick={() => setSort(s.val)}>{s.label}</Chip>
        ))}
      </div>

      {!results && !error && <SkeletonCards n={4} />}
      {error && <EmptyState icon="⚠️" text={error} />}
      {results && (
        results.length ? results.map((t) => (
          <Link key={t._id} to={`/technician/${t._id}`}>
            <Ticket noPerf className="flex items-center gap-3">
              <Avatar name={t.userId?.fullName} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-ink text-sm">{t.userId?.fullName || 'Technician'}</div>
                <div className="text-ink-mute text-[13px]">
                  ⭐ {(t.ratingAvg || 0).toFixed(1)} ({t.ratingCount || 0}) · {t.jobsCompleted || 0} jobs
                  {t.serviceAreas?.[0] ? ` · ${t.serviceAreas[0]}` : ''}
                </div>
              </div>
              <Stamp />
            </Ticket>
          </Link>
        )) : <EmptyState icon="🔍" text="No technicians match these filters" />
      )}
    </Shell>
  );
}
