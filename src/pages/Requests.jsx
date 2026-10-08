import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../lib/api.js';
import { REQUEST_STATUS, formatDate } from '../lib/format.js';
import Shell from '../components/Shell.jsx';
import { Ticket, TicketRow, Badge, Chip, SkeletonCards, EmptyState } from '../components/ui.jsx';

const TABS = [
  { val: '', label: 'All' },
  { val: 'open', label: 'Open' },
  { val: 'quoted', label: 'Quoted' },
  { val: 'booked', label: 'Booked' },
  { val: 'completed', label: 'Completed' },
];

export default function Requests() {
  const location = useLocation();
  const [status, setStatus] = useState('');
  const [list, setList] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setList(null);
    setError('');
    api.get('/repair-requests', { status: status || undefined, limit: 50 })
      .then(({ data }) => setList(data))
      .catch((e) => setError(e.message));
  }, [status]);

  return (
    <Shell title="My repair requests" back activePath={location.pathname} actionIcon="+" actionHref="/request-new">
      <div className="flex gap-2 flex-wrap mb-3.5">
        {TABS.map((t) => (
          <Chip key={t.val} selected={status === t.val} onClick={() => setStatus(t.val)}>{t.label}</Chip>
        ))}
      </div>

      {!list && !error && <SkeletonCards n={3} />}
      {error && <EmptyState icon="⚠️" text={error} />}
      {list && (
        list.length ? list.map((r) => (
          <Link key={r._id} to={`/request/${r._id}`}>
            <Ticket>
              <TicketRow>
                <span className="font-mono text-ink-mute text-[11px]">#{r._id.slice(-6).toUpperCase()}</span>
                <Badge map={REQUEST_STATUS} value={r.status} />
              </TicketRow>
              <div className="font-semibold text-ink mt-1.5">{r.itemType}</div>
              <div className="text-ink-mute text-[13px] mt-0.5">{r.serviceCategoryId?.name || ''} · {formatDate(r.createdAt)}</div>
            </Ticket>
          </Link>
        )) : (
          <EmptyState icon="🧾" text="No repair requests yet" action={
            <Link to="/request-new" className="btn-primary btn-sm inline-flex">+ New request</Link>
          } />
        )
      )}
    </Shell>
  );
}
