import React from 'react';

export function Badge({ map, value }) {
  const m = map[value] || { label: value, cls: 'badge-open' };
  return <span className={m.cls}>{m.label}</span>;
}

export function Ticket({ children, noPerf = false, className = '', ...rest }) {
  return (
    <div className={`ticket ${noPerf ? 'ticket-no-perf' : ''} ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function TicketRow({ children, className = '' }) {
  return <div className={`flex justify-between items-baseline gap-2 ${className}`}>{children}</div>;
}

export function SkeletonCards({ n = 3 }) {
  return (
    <>
      {Array.from({ length: n }).map((_, i) => (
        <div className="ticket" key={i}>
          <div className="h-3.5 w-2/5 mb-2 rounded bg-line/40 animate-pulse" />
          <div className="h-3.5 w-3/5 mb-1.5 rounded bg-line/40 animate-pulse" />
          <div className="h-3.5 w-1/2 rounded bg-line/40 animate-pulse" />
        </div>
      ))}
    </>
  );
}

export function EmptyState({ icon, text, action }) {
  return (
    <div className="text-center py-12 px-4 text-ink-mute">
      <div className="text-3xl mb-2">{icon}</div>
      <div>{text}</div>
      {action && <div className="mt-2.5">{action}</div>}
    </div>
  );
}

export function Chip({ selected, children, ...rest }) {
  return (
    <span className={`chip ${selected ? 'chip-selected' : ''}`} {...rest}>
      {children}
    </span>
  );
}

export function Stamp({ children = 'VERIFIED' }) {
  return <span className="stamp">{children}</span>;
}

export function Avatar({ name, size = 42 }) {
  return (
    <div
      className="rounded-full bg-brand text-white flex items-center justify-center font-bold flex-shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {(name || '?')[0]?.toUpperCase()}
    </div>
  );
}

export function SectionTitle({ children }) {
  return <div className="text-sm font-semibold text-ink mt-5 mb-2.5 first:mt-0">{children}</div>;
}
