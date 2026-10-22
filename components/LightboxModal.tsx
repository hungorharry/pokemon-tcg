'use client';

import React, { useState, useRef } from 'react';
import { PokemonCard, Currency } from '@/types/card';
import { money, ebayLink } from '@/lib/utils';

interface LightboxModalProps {
  card: PokemonCard | null;
  currency: Currency;
  onClose: () => void;
  onOpenDossier: (card: PokemonCard) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  card,
  currency,
  onClose,
  onOpenDossier,
}) => {
  const [zoom, setZoom] = useState(1);
  const [aiCutout, setAiCutout] = useState(true);
  const [transform, setTransform] = useState('');
  const stageRef = useRef<HTMLDivElement>(null);

  if (!card) return null;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -16;
    const rotateY = ((x - centerX) / centerX) * 16;
    setTransform(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(${zoom})`);
  };

  const handleMouseLeave = () => {
    setTransform(`perspective(1000px) rotateX(0deg) rotateY(0deg) scale(${zoom})`);
  };

  const bestPrice = card.listingPriceUSD || card.manualPrice;

  return (
    <div className="pop-backdrop show" onClick={onClose}>
      <div
        className="pop-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', width: '92%' }}
      >
        <div className="pop-head">
          <div>
            <div id="popSub" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--sb-primary-dark)', fontWeight: 700 }}>
              {card.gradeLabel || `PSA ${card.grade || 10}`}
            </div>
            <h3 id="popTitle" style={{ margin: '2px 0 0 0', fontSize: '16px', fontFamily: 'var(--font-heading)', color: 'var(--sb-text-primary)' }}>
              {card.name}
            </h3>
          </div>
          <button className="close" onClick={onClose} title="Đóng (Esc)">
            ✕
          </button>
        </div>

        <div
          className="pop-stage"
          ref={stageRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ height: '420px', position: 'relative', overflow: 'hidden' }}
        >
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(6px)',
              border: '1px solid var(--sb-border)',
              borderRadius: '6px',
              padding: '5px 10px',
              fontSize: '11px',
              color: 'var(--sb-text-secondary)',
              fontWeight: 600,
              zIndex: 10,
              pointerEvents: 'none',
            }}
          >
            ✨ Rê chuột lắc 3D | Phóng to & Tách phông
          </div>

          <div className="pop-toolbar">
            <button
              className={`pop-tool-btn ${aiCutout ? 'active' : ''}`}
              onClick={() => setAiCutout(!aiCutout)}
              title="Bật/Tắt chế độ tách phông AI"
            >
              ✨ Tách phông AI
            </button>
            <button
              className="pop-tool-btn"
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
              title="Thu nhỏ"
            >
              −
            </button>
            <button
              className="pop-tool-btn"
              onClick={() => setZoom(1)}
              title="Về 100%"
            >
              100%
            </button>
            <button
              className="pop-tool-btn"
              onClick={() => setZoom((z) => Math.min(2.0, z + 0.2))}
              title="Phóng to"
            >
              +
            </button>
          </div>

          <div
            style={{
              width: '84%',
              height: '88%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transformStyle: 'preserve-3d',
              transform: transform || `perspective(1000px) scale(${zoom})`,
              transition: 'transform 0.1s ease-out',
            }}
          >
            {card.image ? (
              <img
                src={card.image}
                alt={card.name}
                className={aiCutout ? 'pop-slab-img ai-isolated' : 'pop-slab-img'}
                style={{
                  maxWidth: '85%',
                  maxHeight: '340px',
                  objectFit: 'contain',
                  filter: aiCutout ? 'drop-shadow(0 15px 25px rgba(0,0,0,0.18))' : 'none',
                }}
              />
            ) : (
              <div style={{ color: '#64748B', fontWeight: 600 }}>Không có ảnh hiển thị</div>
            )}
          </div>
        </div>

        <div className="pop-foot">
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--sb-text-primary)' }}>
              {bestPrice ? money(bestPrice, false, currency) : 'Chưa niêm yết'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--sb-text-secondary)', marginTop: '2px' }}>
              Người bán: {card.seller || 'Fanatics / eBay Shop'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="small-button"
              onClick={() => {
                onClose();
                onOpenDossier(card);
              }}
            >
              📋 Xem phân tích chi tiết
            </button>
            <a
              className="small-button primary"
              target="_blank"
              rel="noopener noreferrer"
              href={ebayLink(card)}
            >
              🛒 Xem trên eBay ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
