'use client';

import React, { useState } from 'react';
import { PokemonCard, Currency } from '@/types/card';
import { money } from '@/lib/utils';

interface SelectionSummaryBarProps {
  selectedCards: PokemonCard[];
  currency: Currency;
  onClearSelection: () => void;
}

export const SelectionSummaryBar: React.FC<SelectionSummaryBarProps> = ({
  selectedCards,
  currency,
  onClearSelection,
}) => {
  const [copied, setCopied] = useState(false);

  if (!selectedCards.length) return null;

  // Calculate totals
  const totalListingUSD = selectedCards.reduce((sum, c) => {
    return sum + (Number(c.listingPriceUSD || c.manualPrice || 0));
  }, 0);

  const totalPCUSD = selectedCards.reduce((sum, c) => {
    return sum + (Number(c.pricecharting || 0));
  }, 0);

  const diffUSD = totalListingUSD - totalPCUSD;
  const diffPct = totalPCUSD > 0 ? (diffUSD / totalPCUSD) * 100 : 0;
  const isCheaper = diffUSD < 0;

  const handleCopySummary = () => {
    const lines = [
      `📊 TỔNG HỢP DANH MỤC THẺ ĐÃ CHỌN (${selectedCards.length} THẺ)`,
      `--------------------------------------------------`,
      ...selectedCards.map((c, idx) => {
        const p = Number(c.listingPriceUSD || c.manualPrice || 0);
        const pc = Number(c.pricecharting || 0);
        const d = p - pc;
        const dp = pc > 0 ? (d / pc) * 100 : 0;
        const sign = d > 0 ? '+' : '';
        return `${idx + 1}. [${c.gradeLabel || `PSA ${c.grade}`}] ${c.name} (${c.character})
   - Giá rao: ${money(p, false, currency)} | Giá PC: ${money(pc, false, currency)} [${sign}${dp.toFixed(1)}%]
   - Người bán: ${c.seller || 'N/A'}
   - Link: ${c.listingUrl || c.manualUrl || ''}`;
      }),
      `--------------------------------------------------`,
      `💰 TỔNG GIÁ RAO (LISTING): ${money(totalListingUSD, false, currency)}`,
      `📈 TỔNG GIÁ PRICECHARTING: ${money(totalPCUSD, false, currency)}`,
      `⚖️ CHÊNH LỆCH: ${isCheaper ? 'TIẾT KIỆM' : 'CAO HƠN'} ${money(Math.abs(diffUSD), false, currency)} (${diffPct > 0 ? '+' : ''}${diffPct.toFixed(1)}%)`,
    ];

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        width: 'min(980px, 94vw)',
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(16px)',
        border: '1.5px solid rgba(63, 207, 142, 0.5)',
        borderRadius: '16px',
        padding: '16px 24px',
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 0 20px rgba(63, 207, 142, 0.25)',
        color: '#FFFFFF',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        animation: 'slideUp 0.25s ease-out',
      }}
    >
      {/* Left: Count Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #10B981, #059669)',
            borderRadius: '10px',
            padding: '8px 14px',
            fontWeight: 800,
            fontSize: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
          }}
        >
          <span>✓</span>
          <span>Đã chọn {selectedCards.length} thẻ</span>
        </div>
      </div>

      {/* Center: Total Prices */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          flexWrap: 'wrap',
        }}
      >
        {/* Total Listing Price */}
        <div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8', fontWeight: 600 }}>
            🏷️ Tổng Giá Rao (Listing)
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#F8FAFC' }}>
            {money(totalListingUSD, false, currency)}
          </div>
        </div>

        {/* Total PriceCharting */}
        <div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94A3B8', fontWeight: 600 }}>
            📈 Tổng Giá PriceCharting
          </div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#34D399' }}>
            {money(totalPCUSD, false, currency)}
          </div>
        </div>

        {/* Diff Arbitrage */}
        <div
          style={{
            background: isCheaper ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${isCheaper ? '#10B981' : '#EF4444'}`,
            padding: '6px 12px',
            borderRadius: '8px',
          }}
        >
          <div style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.05em', color: isCheaper ? '#34D399' : '#FCA5A5', fontWeight: 700 }}>
            {isCheaper ? '🔥 Tiết Kiệm (Rẻ Hơn PC)' : '⚠️ Cao Hơn PC'}
          </div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: isCheaper ? '#6EE7B7' : '#F87171' }}>
            {isCheaper ? '-' : '+'}{money(Math.abs(diffUSD), false, currency)} ({diffPct > 0 ? '+' : ''}{diffPct.toFixed(1)}%)
          </div>
        </div>
      </div>

      {/* Right: Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          onClick={handleCopySummary}
          style={{
            background: copied ? '#059669' : '#334155',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 14px',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
          title="Sao chép báo cáo chi tiết các thẻ đã chọn"
        >
          <span>{copied ? '✅ Đã chép!' : '📋 Chép tóm tắt'}</span>
        </button>

        <button
          onClick={onClearSelection}
          style={{
            background: 'transparent',
            color: '#94A3B8',
            border: '1px solid #475569',
            borderRadius: '8px',
            padding: '8px 12px',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#F8FAFC';
            e.currentTarget.style.borderColor = '#94A3B8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#94A3B8';
            e.currentTarget.style.borderColor = '#475569';
          }}
          title="Bỏ chọn tất cả các thẻ"
        >
          ✕ Bỏ chọn
        </button>
      </div>
    </div>
  );
};
