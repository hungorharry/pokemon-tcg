'use client';

import React from 'react';
import { PokemonCard } from '@/types/card';
import { dec, getScore, getDiff } from '@/lib/utils';

interface StatGridProps {
  catalog: PokemonCard[];
}

export const StatGrid: React.FC<StatGridProps> = ({ catalog }) => {
  const total = catalog.length;
  const premium = catalog.filter((c) => getScore(c) >= 80).length;
  const priced = catalog.filter((c) => c.listingPriceUSD != null || c.manualPrice != null).length;
  const discount = catalog.filter((c) => {
    const d = getDiff(c);
    return d !== null && d <= -10;
  }).length;

  return (
    <section className="stat-grid">
      <div className="stat">
        <label>Tổng danh mục</label>
        <b>{dec(total)}</b>
        <div className="sub">Snorlax + Munchlax PSA</div>
      </div>
      <div className="stat">
        <label>Ưu tiên S / A</label>
        <b>{dec(premium)}</b>
        <div className="sub">Điểm tiềm năng từ 80+</div>
      </div>
      <div className="stat">
        <label>Giá sàn đã tra</label>
        <b>{dec(priced)}</b>
        <div className="sub">eBay & Fanatics Buy Now</div>
      </div>
      <div className="stat">
        <label>Đang rẻ hơn PC</label>
        <b>{dec(discount)}</b>
        <div className="sub">Giá rao thấp hơn ≥10%</div>
      </div>
    </section>
  );
};
