import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { href: '/home', icon: '🏠', label: 'Home', match: ['/home', '/'] },
  { href: '/search', icon: '🔍', label: 'Search', match: ['/search', '/technician'] },
  { href: '/jobs', icon: '🧾', label: 'My Jobs', match: ['/jobs', '/job', '/requests', '/request', '/booking', '/payment', '/warranty', '/review'] },
  { href: '/profile', icon: '👤', label: 'Profile', match: ['/profile', '/notifications'] },
];

export function TopBar({ title, back = false, actionIcon, onAction, actionHref, showDot = false }) {
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-20 bg-brand text-white px-4 py-3.5 flex items-center gap-2.5 min-h-[56px]">
      {back ? (
        <button aria-label="Back" onClick={() => navigate(-1)} className="text-lg leading-none pr-1">←</button>
      ) : (
        <span className="w-[26px] h-[26px] rounded-md bg-white flex items-center justify-center flex-shrink-0">
          <img src="/logo-96.png" alt="" className="w-[18px] h-[18px] object-contain" />
        </span>
      )}
      <h1 className="text-[16px] text-white flex-1 font-medium">{title}</h1>
      {actionIcon && (
        <button
          aria-label="action"
          className="relative text-lg"
          onClick={actionHref ? () => navigate(actionHref) : onAction}
        >
          {actionIcon}
          {showDot && <span className="absolute -top-0.5 -right-0.5 w-[7px] h-[7px] bg-amber rounded-full border-[1.5px] border-brand" />}
        </button>
      )}
    </div>
  );
}

export function BottomNav({ active }) {
  return (
    <div className="sticky bottom-0 z-20 bg-paper border-t border-line grid grid-cols-4 max-w-[480px] mx-auto w-full">
      {NAV_ITEMS.map((item) => {
        const isActive = item.match.some((m) => active === m || active.startsWith(m + '/') || (m !== '/' && active.startsWith(m)));
        return (
          <Link
            key={item.href}
            to={item.href}
            className={`text-center py-2.5 pb-2.5 flex flex-col gap-0.5 items-center text-[11px] ${
              isActive ? 'text-brand font-semibold' : 'text-ink-mute'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

/**
 * Standard page wrapper: sticky top bar + scrollable content + optional bottom nav.
 * `activePath` is the current location.pathname, used to highlight the right tab.
 */
export default function Shell({ title, back, showNav = true, activePath = '', actionIcon, onAction, actionHref, showDot, children }) {
  return (
    <div className="max-w-[480px] mx-auto min-h-screen bg-steel flex flex-col relative">
      <TopBar title={title} back={back} actionIcon={actionIcon} onAction={onAction} actionHref={actionHref} showDot={showDot} />
      <div className="flex-1 px-4 pt-4 pb-24">{children}</div>
      {showNav && <BottomNav active={activePath} />}
    </div>
  );
}
