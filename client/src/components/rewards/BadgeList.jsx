import React from 'react';
import BadgePill from './BadgePill';

export default function BadgeList({ badges = [] }) {
  if (!badges.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {badges.map((b) => <BadgePill key={b} badge={b} />)}
    </div>
  );
}
