'use client';

import React from 'react';

export const Hero: React.FC = () => {
  return (
    <section className="hero">
      <div>
        <div className="eyebrow">THE INFINITE COLLECTOR | VOL. 01</div>
        <h1>
          Snorlax <span>&</span>
          <br />
          Munchlax <span>Atlas.</span>
        </h1>
        <p>
          Bảng đầu tư thẻ Slab PSA cao cấp với phân hạng S–F, Population, PriceCharting và săn giá{' '}
          <strong>Buy It Now trên eBay & Fanatics Collect</strong>. Rê chuột lên thẻ để xem thông tin và giá chào bán.
        </p>
      </div>
      <div className="hero-note">
        <strong>◆ TIÊU CHUẨN ĐẦU TƯ SLAB</strong> PSA ONLY (Chỉ nhận thẻ đã chấm điểm PSA) | Giá cố định Buy Now | Không Auction | Không biến giá rao thành giá đã bán.
      </div>
    </section>
  );
};
