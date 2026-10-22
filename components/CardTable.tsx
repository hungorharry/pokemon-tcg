'use client';

import React from 'react';
import { PokemonCard, Currency } from '@/types/card';
import { gradeToTier, getScore, getDiff, money, isEstimated, dec } from '@/lib/utils';

interface CardTableProps {
  cards: PokemonCard[];
  currency: Currency;
  onOpenDetail: (card: PokemonCard) => void;
  onToggleSort: (type: 'pc' | 'price') => void;
}

export const CardTable: React.FC<CardTableProps> = ({
  cards,
  currency,
  onOpenDetail,
  onToggleSort,
}) => {
  const badgeDiff = (d: number | null) => {
    if (d == null) return <span className="delta mid">Chưa có %</span>;
    const isGood = d <= -10;
    const isBad = d >= 12;
    return (
      <span className={`delta ${isGood ? 'good' : isBad ? 'bad' : 'mid'}`}>
        {d > 0 ? '+' : ''}
        {d.toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="tablewrap">
      <table className="ranking">
        <thead>
          <tr>
            <th>Tier</th>
            <th>Tên thẻ</th>
            <th>Nhân vật</th>
            <th>PSA 10 Pop</th>
            <th
              style={{ cursor: 'pointer', color: '#0A844E', userSelect: 'none' }}
              onClick={() => onToggleSort('pc')}
              title="Bấm để đảo chiều sắp xếp theo PriceCharting"
            >
              PriceCharting ↕
            </th>
            <th
              style={{ cursor: 'pointer', color: '#00529B', userSelect: 'none' }}
              onClick={() => onToggleSort('price')}
              title="Bấm để đảo chiều sắp xếp theo Giá eBay/Fanatics"
            >
              Giá thị trường ↕
            </th>
            <th>Chênh %</th>
            <th>Điểm</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {cards.map((c) => {
            const score = getScore(c);
            const tier = gradeToTier(score);
            const diff = getDiff(c);
            const bestPrice = c.listingPriceUSD || c.manualPrice;

            return (
              <tr key={c.id}>
                <td>
                  <span className={`tierSmall letter-${tier}`}>{tier}</span>
                </td>
                <td>
                  <div className="rankname">{c.name}</div>
                  <div className="ranksecondary">
                    {c.set} {c.variant} • PSA {c.grade || 10}
                  </div>
                </td>
                <td>{c.character}</td>
                <td>{c.psa10pop != null ? dec(c.psa10pop) : '—'}</td>
                <td>
                  <b style={{ color: '#0A844E' }}>{money(c.pricecharting, false, currency)}</b>
                </td>
                <td>
                  <strong>{bestPrice ? money(bestPrice, false, currency) : 'Chưa có giá'}</strong>
                </td>
                <td>{badgeDiff(diff)}</td>
                <td>
                  {score}
                  {isEstimated(c) ? '*' : ''}
                </td>
                <td>
                  <button className="small-button" onClick={() => onOpenDetail(c)}>
                    Chi tiết
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
