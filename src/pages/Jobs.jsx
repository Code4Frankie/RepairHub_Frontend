import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../lib/api.js';
import { JOB_STATUS, PAYMENT_STATUS, formatDate, formatNaira } from '../lib/format.js';
import Shell from '../components/Shell.jsx';
import { Ticket, TicketRow, Badge, Chip, SkeletonCards, EmptyState } from '../components/ui.jsx';

export default function Jobs() {
  const location = useLocation();
  const [list, setList] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/repair-jobs', { limit: 50 }).then(({ data }) => setList(data)).catch((e) => setError(e.message));
  }, []);

  return (
    <Shell title="My jobs" activePath={location.pathname}>
      <div className="flex gap-2 flex-wrap mb-3.5">
        <Link to="/requests"><Chip>📋 Repair requests</Chip></Link>
        <Link to="/jobs"><Chip selected>🧾 Active jobs</Chip></Link>
      </div>

      {!list && !error && <SkeletonCards n={3} />}
      {error && <EmptyState icon="⚠️" text={error} />}
      {list && (
        list.length ? list.map((j) => (
          <Link key={j._id} to={`/job/${j._id}`}>
            <Ticket>
              <TicketRow>
                <span className="font-mono text-ink-mute text-[11px]">#{j._id.slice(-6).toUpperCase()}</span>
                <Badge map={JOB_STATUS} value={j.status} />
              </TicketRow>
              <div className="font-semibold text-ink mt-1.5">{j.repairRequestId?.itemType || 'Repair job'}</div>
              <TicketRow className="mt-1">
                <span className="text-ink-mute font-mono text-[13px]">{formatNaira(j.price)}</span>
                <Badge map={PAYMENT_STATUS} value={j.payment?.status} />
              </TicketRow>
              <div className="text-ink-mute text-[13px] mt-0.5">{formatDate(j.createdAt)}</div>
            </Ticket>
          </Link>
        )) : (
          <EmptyState icon="🧾" text="No active jobs yet" action={
            <Link to="/request-new" className="btn-primary btn-sm inline-flex">+ New request</Link>
          } />
        )
      )}
    </Shell>
  );
}
