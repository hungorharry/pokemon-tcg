'use client';

import React from 'react';
import { Currency, SortOption } from '@/types/card';
import { dec } from '@/lib/utils';

interface ToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  character: string;
  onCharacterChange: (c: string) => void;
  sort: SortOption;
  onSortChange: (s: SortOption) => void;
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
  grade: string;
  onGradeChange: (g: string) => void;
  showFavoritesOnly: boolean;
  onToggleFavorites: () => void;
  viewMode: 'grid' | 'table';
  onViewModeChange: (v: 'grid' | 'table') => void;
  resultCount: number;
  snorlaxCount: number;
  munchlaxCount: number;
  psa10Count: number;
  psa9Count: number;
  psaSub9Count: number;
  title: string;
  onSyncFanatics: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  searchQuery,
  onSearchChange,
  character,
  onCharacterChange,
  sort,
  onSortChange,
  currency,
  onCurrencyChange,
  grade,
  onGradeChange,
  showFavoritesOnly,
  onToggleFavorites,
  viewMode,
  onViewModeChange,
  resultCount,
  snorlaxCount,
  munchlaxCount,
  psa10Count,
  psa9Count,
  psaSub9Count,
  title,
  onSyncFanatics,
}) => {
  const sortLabels: Record<string, string> = {
    score: 'Điểm tiềm năng',
    pc_desc: 'Giá PC (Cao → Thấp)',
    pc_asc: 'Giá PC (Thấp → Cao)',
    price_desc: 'Giá sàn (Cao → Thấp)',
    price_asc: 'Giá sàn (Thấp → Cao)',
    deal: 'Săn Deal hời so với PC',
    scarcity: 'PSA 10 khan hiếm',
    year_old: 'Thẻ cổ nhất',
    year_new: 'Thẻ mới nhất',
  };

  return (
    <>
      <section className="bar">
        <label className="search">
          <span>⌕</span>
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm tên, bộ thẻ, số #, promo..."
            autoComplete="off"
          />
        </label>

        <select
          value={character}
          onChange={(e) => onCharacterChange(e.target.value)}
          className="control"
        >
          <option value="all">Snorlax + Munchlax</option>
          <option value="Snorlax">Chỉ Snorlax</option>
          <option value="Munchlax">Chỉ Munchlax</option>
        </select>

        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="control"
          style={{ fontWeight: 700 }}
        >
          <option value="score">🏆 Điểm tiềm năng: Cao → Thấp</option>
          <option value="seller_rep">🛡️ Uy tín Seller: Giao dịch nhiều nhất (&gt;8.000 GD)</option>
          <option value="pc_desc">📈 Giá PriceCharting: Cao → Thấp</option>
          <option value="pc_asc">📉 Giá PriceCharting: Thấp → Cao</option>
          <option value="price_desc">💎 Giá sàn Buy Now: Cao → Thấp</option>
          <option value="price_asc">🏷️ Giá sàn Buy Now: Thấp → Cao</option>
          <option value="deal">🔥 Săn Deal: Rẻ hơn PC nhiều nhất</option>
          <option value="scarcity">👑 PSA 10 ít nhất (Pop hiếm)</option>
          <option value="year_old">🕰️ Đời thẻ: Cổ nhất trước</option>
          <option value="year_new">✨ Đời thẻ: Mới nhất trước</option>
        </select>

        <div className="cur-switch" title="Chuyển đổi tiền tệ hiển thị">
          <button
            className={`cur-btn ${currency === 'VND' ? 'active' : ''}`}
            onClick={() => onCurrencyChange('VND')}
          >
            ₫ VNĐ
          </button>
          <button
            className={`cur-btn ${currency === 'USD' ? 'active' : ''}`}
            onClick={() => onCurrencyChange('USD')}
          >
            $ USD
          </button>
        </div>

        <select
          value={grade}
          onChange={(e) => onGradeChange(e.target.value)}
          className="control"
          style={{ fontWeight: 700 }}
        >
          <option value="all">Tất cả Grade (7-10)</option>
          <option value="10">Chỉ Grade 10 (Gem Mint/Pristine)</option>
          <option value="9">Chỉ Grade 9 (Mint)</option>
          <option value="8">Chỉ Grade 8 (NM-MT)</option>
          <option value="7">Chỉ Grade 7 (Near Mint)</option>
        </select>

        <select className="control" style={{ fontWeight: 700 }} disabled>
          <option value="PSA">Chỉ PSA (PSA Only)</option>
        </select>

        <button
          className={`toggle ${showFavoritesOnly ? 'active' : ''}`}
          onClick={onToggleFavorites}
        >
          {showFavoritesOnly ? '♥ Đã lọc yêu thích' : '♡ Đã lưu'}
        </button>
      </section>

      <section className="toolbar2">
        <div className="toolbar2-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                display: 'inline-block',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#3FCF8E',
                boxShadow: '0 0 10px #3FCF8E',
              }}
            ></span>
            <h2
              className="sectiontitle"
              style={{
                margin: 0,
                fontSize: '20px',
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                color: '#111827',
                letterSpacing: '-0.02em',
              }}
            >
              {title}
            </h2>
          </div>

          <div style={{ marginTop: '4px' }}>
            <div className="meta-pills">
              <span className="meta-box highlight">
                <span className="dot" style={{ width: '6px', height: '6px', margin: 0, background: '#0A844E' }}></span>
                <b>{dec(resultCount)}</b> phiên bản PSA
              </span>
              <span
                className="meta-box"
                style={{
                  background: '#ECFDF5',
                  borderColor: 'rgba(16,185,129,0.3)',
                  color: '#047857',
                }}
              >
                <span>🔄</span> <b>{sortLabels[sort] || 'Điểm tiềm năng'}</b>
              </span>
              <span className="meta-box">
                <span>🐻</span> <b>{dec(snorlaxCount)}</b> Snorlax
              </span>
              <span className="meta-box">
                <span>🍎</span> <b>{dec(munchlaxCount)}</b> Munchlax
              </span>
              <span
                className="meta-box"
                style={{
                  color: '#E11D48',
                  borderColor: 'rgba(225,29,72,0.3)',
                  background: '#FFF1F2',
                }}
              >
                <span>🏆</span> <b>{dec(psa10Count)}</b> PSA 10
              </span>
              <span
                className="meta-box"
                style={{
                  color: '#0284C7',
                  borderColor: 'rgba(2,132,199,0.3)',
                  background: '#F0F9FF',
                }}
              >
                <span>✨</span> <b>{dec(psa9Count)}</b> PSA 9
              </span>
              {psaSub9Count > 0 && (
                <span
                  className="meta-box"
                  style={{
                    color: '#D97706',
                    background: '#FFFBEB',
                    borderColor: 'rgba(217,119,6,0.3)',
                  }}
                >
                  <span>🎯</span> <b>{dec(psaSub9Count)}</b> PSA 7-8
                </span>
              )}
              <span className="meta-box blue">
                <span>⚡</span> Fanatics Collect Live
              </span>
            </div>
          </div>
        </div>

        <div className="toolbar2-right">
          <div className="chips">
            <button
              className={`chip ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => onViewModeChange('grid')}
            >
              ▦ Cards
            </button>
            <button
              className={`chip ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => onViewModeChange('table')}
            >
              ☷ Table
            </button>
          </div>
          <div className="toolbar-actions" style={{ display: 'flex', gap: '8px' }}>
            <button
              className="small-button"
              onClick={onSyncFanatics}
              style={{
                color: '#00529B',
                borderColor: 'rgba(0,82,155,0.3)',
                background: '#F0F7FF',
                fontWeight: 700,
              }}
              title="Đồng bộ thẻ thật đang bán từ sàn Fanatics Collect Vault"
            >
              ⚡ Đồng bộ Fanatics
            </button>
          </div>
        </div>
      </section>
    </>
  );
};
