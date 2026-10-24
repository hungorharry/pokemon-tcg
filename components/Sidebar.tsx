'use client';

import React from 'react';
import { PokemonCard, TierLevel } from '@/types/card';
import { gradeToTier, getScore, dec } from '@/lib/utils';
import { TIER_META } from '@/lib/constants';

interface SidebarProps {
  currentTier: TierLevel;
  onSelectTier: (tier: TierLevel) => void;
  catalog: PokemonCard[];
  serverOnline: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTier,
  onSelectTier,
  catalog,
  serverOnline,
}) => {
  const keys: TierLevel[] = ['ALL', 'S', 'A', 'B', 'C', 'D', 'F'];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div
          className="brandmark"
          style={{
            background: '#111827',
            borderRadius: '6px',
            width: '30px',
            height: '30px',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9" stroke="#3FCF8E" strokeWidth="2" />
            <path d="M3 12H8.5M15.5 12H21" stroke="#3FCF8E" strokeWidth="2" />
            <circle cx="12" cy="12" r="3.2" fill="#3FCF8E" stroke="#111827" strokeWidth="1.5" />
          </svg>
        </div>
        <div>
          <strong>
            SNORLAX <span style={{ color: 'var(--sb-primary-dark)' }}>ATLAS</span>
          </strong>
          <small>COLLECTIBLE INTELLIGENCE (NEXT.JS)</small>
        </div>
      </div>

      <nav id="tierNav">
        <p className="sideLabel tier-nav-title">Xếp hạng đầu tư</p>
        {keys.map((k) => {
          const count = catalog.filter(
            (c) => k === 'ALL' || (c.tier || gradeToTier(getScore(c))) === k
          ).length;
          const meta = TIER_META[k];
          return (
            <button
              key={k}
              className={`side-item ${currentTier === k ? 'active' : ''}`}
              onClick={() => onSelectTier(k)}
            >
              {k === 'ALL' ? (
                <>
                  <span className="label">▦ &nbsp; Tất cả thẻ</span>
                  <span className="letter-S side-letter">*</span>
                </>
              ) : (
                <span>
                  <i className={`side-letter letter-${k}`}>{k}</i>
                  <span className="label">{meta.name}</span>
                </span>
              )}
              <b>{dec(count)}</b>
            </button>
          );
        })}
      </nav>

      <div className="side-flex"></div>

      <div className="side-foot">
        <div>
          <span className={`dot ${serverOnline ? '' : 'off'}`}></span>
          <span>{serverOnline ? 'Next.js App Engine Online' : 'Next.js Client Mode'}</span>
        </div>
        <div style={{ marginTop: '4px' }}>Dữ liệu bộ nhớ thời gian thực</div>
        <div style={{ marginTop: '8px' }}>
          S / A / B / C / D / F là đánh giá đầu tư, <strong>không phải grade PSA.</strong>
        </div>
      </div>
    </aside>
  );
};
