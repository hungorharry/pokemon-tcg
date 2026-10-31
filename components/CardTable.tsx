'use client';

import React from 'react';
import { PokemonCard, Currency } from '@/types/card';
import { gradeToTier, getScore, getDiff, money, isEstimated, dec } from '@/lib/utils';

interface CardTableProps {
  cards: PokemonCard[];
  currency: Currency;
  onOpenDetail: (card: PokemonCard) => void;
  onToggleSort: (type: 'pc' | 'price') => void;
  onToggleSelect?: (id: string) => void;
  selectedCardIds?: Record<string, boolean>;
  onSelectAll?: () => void;
}

export const CardTable: React.FC<CardTableProps> = ({
  cards,
  currency,
  onOpenDetail,
  onToggleSort,
  onToggleSelect,
  selectedCardIds = {},
  onSelectAll,
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
            {onToggleSelect && (
              <th style={{ width: '40px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                  checked={cards.length > 0 && cards.every((c) => selectedCardIds[c.id])}
                  onChange={onSelectAll}
                  title="Chọn tất cả các thẻ đang lọc"
                />
              </th>
            )}
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
            const tier = c.tier || gradeToTier(score);
            const diff = getDiff(c);
            const bestPrice = c.listingPriceUSD || c.manualPrice;

            const isSelected = Boolean(selectedCardIds[c.id]);

            return (
              <tr
                key={c.id}
                style={
                  isSelected
                    ? {
                        background: 'rgba(16, 185, 129, 0.08)',
                        outline: '1px solid rgba(16, 185, 129, 0.3)',
                      }
                    : undefined
                }
              >
                {onToggleSelect && (
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                      checked={isSelected}
                      onChange={() => onToggleSelect(c.id)}
                      title="Chọn thẻ này"
                    />
                  </td>
                )}
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
