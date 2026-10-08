export const formatNaira = (n) =>
  '₦' + Number(n || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 });

export const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

export const timeAgo = (d) => {
  if (!d) return '—';
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

// Status enums mirror the backend models exactly (see model/*.js in the API repo).
export const REQUEST_STATUS = {
  open: { label: 'Open', cls: 'badge-open' },
  quoted: { label: 'Quotes in', cls: 'badge-progress' },
  booked: { label: 'Booked', cls: 'badge-progress' },
  in_progress: { label: 'In progress', cls: 'badge-progress' },
  completed: { label: 'Completed', cls: 'badge-success' },
  cancelled: { label: 'Cancelled', cls: 'badge-alert' },
};

export const JOB_STATUS = {
  accepted: { label: 'Accepted', cls: 'badge-open' },
  diagnosing: { label: 'Diagnosing', cls: 'badge-progress' },
  awaiting_parts: { label: 'Awaiting parts', cls: 'badge-progress' },
  in_progress: { label: 'In progress', cls: 'badge-progress' },
  quality_check: { label: 'Quality check', cls: 'badge-progress' },
  ready: { label: 'Ready', cls: 'badge-progress' },
  on_hold: { label: 'On hold', cls: 'badge-alert' },
  completed: { label: 'Completed', cls: 'badge-success' },
  disputed: { label: 'Disputed', cls: 'badge-alert' },
  cancelled: { label: 'Cancelled', cls: 'badge-alert' },
};

export const PAYMENT_STATUS = {
  unpaid: { label: 'Unpaid', cls: 'badge-alert' },
  held: { label: 'In escrow', cls: 'badge-progress' },
  released: { label: 'Released', cls: 'badge-success' },
  refunded: { label: 'Refunded', cls: 'badge-open' },
  cash: { label: 'Pay on delivery', cls: 'badge-progress' },
  cash_settled: { label: 'Paid (cash)', cls: 'badge-success' },
};

export const QUOTE_STATUS = {
  pending: { label: 'Pending', cls: 'badge-open' },
  accepted: { label: 'Accepted', cls: 'badge-success' },
  rejected: { label: 'Rejected', cls: 'badge-alert' },
  expired: { label: 'Expired', cls: 'badge-alert' },
  withdrawn: { label: 'Withdrawn', cls: 'badge-alert' },
};

// Ordered pipeline for the job-tracking timeline; on_hold/disputed/cancelled render
// as a banner instead, since they're exceptions rather than a stage in sequence.
export const JOB_PIPELINE = ['accepted', 'diagnosing', 'in_progress', 'quality_check', 'ready', 'completed'];

const ICON_RULES = [
  [/phone|mobile/i, '📱'], [/laptop|computer|pc/i, '💻'], [/tablet/i, '📟'],
  [/fridge|refrigerat/i, '🧊'], [/wash(ing)?/i, '🌀'], [/ac|air\s?cond/i, '❄️'],
  [/microwave|oven|cooker/i, '🍳'], [/tv|television/i, '📺'], [/generator/i, '⚡'],
  [/furniture|chair|sofa|wood/i, '🪑'], [/plumb/i, '🚰'], [/electric/i, '🔌'],
  [/carpentry|carpenter/i, '🪚'], [/print/i, '🖨️'],
];
export const iconForCategory = (name = '') => (ICON_RULES.find(([rx]) => rx.test(name)) || [, '🔧'])[1];
