import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../lib/api.js';
import { useToast } from '../lib/ToastContext.jsx';
import { timeAgo } from '../lib/format.js';
import Shell from '../components/Shell.jsx';
import { Ticket, SkeletonCards, EmptyState } from '../components/ui.jsx';

const TYPE_ICON = {
  repair_request: '🧾', quotation: '💬', appointment: '📅', status_update: '🔧',
  payment: '💳', warranty: '🛡️', review: '⭐', dispute: '⚠️', verification: '✅',
};

export default function Notifications() {
  const location = useLocation();
  const { toastError } = useToast();
  const [list, setList] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api.get('/notifications', { limit: 50 })
      .then(({ data, meta }) => { setList(data); setUnreadCount(meta?.unreadCount || 0); })
      .catch((e) => setError(e.message));
  }, []);

  useEffect(() => { load(); }, [load]);

  async function markRead(id) {
    try {
      await api.patch(`/notifications/${id}/read`, {});
      setList((l) => l.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) { toastError(err); }
  }

  async function markAllRead() {
    try {
      await api.patch('/notifications/read-all', {});
      setList((l) => l.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) { toastError(err); }
  }

  return (
    <Shell
      title="Notifications" back activePath={location.pathname}
      actionIcon={unreadCount > 0 ? '✓' : undefined}
      onAction={unreadCount > 0 ? markAllRead : undefined}
    >
      {unreadCount > 0 && <p className="text-ink-mute text-[13px] mb-3">{unreadCount} unread — tap the ✓ above to mark all read</p>}
      {!list && !error && <SkeletonCards n={4} />}
      {error && <EmptyState icon="⚠️" text={error} />}
      {list && (
        list.length ? list.map((n) => (
          <Ticket
            key={n._id}
            noPerf
            className={`cursor-pointer ${!n.isRead ? 'border-brand' : ''}`}
            onClick={() => !n.isRead && markRead(n._id)}
          >
            <div className="flex gap-2.5">
              <span className="text-lg flex-shrink-0">{TYPE_ICON[n.type] || '🔔'}</span>
              <div className="flex-1 min-w-0">
                <div className={`text-[13px] ${!n.isRead ? 'font-semibold text-ink' : 'text-ink-mute'}`}>{n.message}</div>
                <div className="text-ink-mute text-xs mt-1">{timeAgo(n.createdAt)}</div>
              </div>
              {!n.isRead && <span className="w-2 h-2 rounded-full bg-brand mt-1.5 flex-shrink-0" />}
            </div>
          </Ticket>
        )) : <EmptyState icon="🔔" text="No notifications yet" />
      )}
    </Shell>
  );
}
