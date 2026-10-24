import { PokemonCard, Currency, LiveItem } from '@/types/card';
import { RATE_USD_VND } from './constants';

export const dec = (n: number | string | null | undefined): string => {
  if (n == null) return '0';
  return Number(n).toLocaleString('vi-VN');
};

export const gradeToTier = (s: number): 'S' | 'A' | 'B' | 'C' | 'D' | 'F' => {
  if (s >= 90) return 'S';
  if (s >= 80) return 'A';
  if (s >= 65) return 'B';
  if (s >= 50) return 'C';
  if (s >= 40) return 'D';
  return 'F';
};

export const estimatedScore = (c: PokemonCard): number => {
  let s = 46;
  const v = `${c.name} ${c.variant} ${c.set}`.toLowerCase();
  if (c.year && c.year <= 2005) s += 18;
  else if (c.year && c.year <= 2011) s += 10;
  else if (c.year && c.year <= 2020) s += 5;
  if (/japan|promo/.test(v)) s += 5;
  if (/holo|reverse|gold|staff|ex\b|lv.?x|special/.test(v)) s += 7;
  if (/1st|first edition|error|no symbol|pokepark/.test(v)) s += 9;
  return Math.min(s, 89);
};

export const getScore = (c: PokemonCard): number => {
  if (c.tierScore != null && Number.isFinite(+c.tierScore) && c.tierScore !== 0) {
    return Math.min(100, Math.max(0, +c.tierScore));
  }
  return estimatedScore(c);
};

export const isEstimated = (c: PokemonCard): boolean => {
  return c.tierScore == null || c.tierScore === 0 || !Number.isFinite(+c.tierScore);
};

export const getBest = (c: PokemonCard): LiveItem | null => {
  if (c.listingPriceUSD != null && +c.listingPriceUSD > 0) {
    return {
      price: +c.listingPriceUSD,
      currency: 'USD',
      title: c.listingTitle || 'Listing người bán thực tế',
      url: c.listingUrl || '',
    };
  }
  if (c.manualPrice != null && +c.manualPrice > 0) {
    return {
      price: +c.manualPrice,
      currency: 'USD',
      title: 'Giá tham khảo nhập thủ công',
      manual: true,
      url: c.manualUrl || '',
    };
  }
  return null;
};

export const getDiff = (c: PokemonCard): number | null => {
  if (c.diffPercent != null && Number.isFinite(+c.diffPercent)) {
    return +c.diffPercent;
  }
  const b = getBest(c);
  if (!b || !c.pricecharting || b.currency !== 'USD') return null;
  return ((b.price / c.pricecharting) - 1) * 100;
};

export const money = (usd: number | null | undefined, compact = false, currency: Currency = 'VND'): string => {
  if (usd == null || !Number.isFinite(+usd)) return '—';
  if (currency === 'VND') {
    const vnd = Math.round(+usd * RATE_USD_VND);
    if (compact) {
      if (vnd >= 1_000_000_000) return (vnd / 1_000_000_000).toFixed(2).replace(/\.00$/, '') + ' tỷ ₫';
      if (vnd >= 10_000_000) return (vnd / 1_000_000).toFixed(1).replace(/\.0$/, '') + ' tr ₫';
      return vnd.toLocaleString('vi-VN') + ' ₫';
    }
    return vnd.toLocaleString('vi-VN') + ' ₫';
  }
  return '$' + (+usd).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
};

export const moneyDual = (usd: number | null | undefined): string => {
  if (usd == null || !Number.isFinite(+usd)) return '—';
  const vnd = Math.round(+usd * RATE_USD_VND);
  const formattedUsd = (+usd).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return `${vnd.toLocaleString('vi-VN')} ₫ (~$${formattedUsd} USD)`;
};

export const cleanCardKeyword = (c: PokemonCard): string => {
  return (c.name || '')
    .replace(new RegExp(c.character, 'gi'), '')
    .replace(/#\d+/g, '')
    .replace(/\b(?:psa|cgc|bgs|sgc)\s*[\d.]+\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const fanaticsLink = (c: PokemonCard): string => {
  if (c.listingUrl && c.listingUrl.includes('fanaticscollect.com')) return c.listingUrl;
  const q = encodeURIComponent(c.character + ' ' + cleanCardKeyword(c));
  return 'https://www.fanaticscollect.com/marketplace?type=FIXED&q=' + q;
};

export const ebayLink = (c: PokemonCard): string => {
  if (c.ebayItemUrl && c.ebayItemUrl.includes('ebay.com/itm/')) return c.ebayItemUrl;
  if (c.manualUrl && c.manualUrl.includes('ebay.com/itm/')) return c.manualUrl;
  if (c.listingUrl && c.listingUrl.includes('ebay.com')) return c.listingUrl;
  const co = c.slabCompany || 'PSA';
  const gr = c.grade || 10;
  const q = encodeURIComponent(c.character + ' ' + cleanCardKeyword(c) + ' ' + co + ' ' + gr);
  return 'https://www.ebay.com/sch/i.html?_nkw=' + q + '&LH_BIN=1&LH_Auction=0&rt=nc';
};

export const getPsaBreakdown = (c: PokemonCard) => {
  const total = c.psaTotal || (c.psa10pop ? Math.round(c.psa10pop * 3.5) : 100);
  const p10 = c.psa10pop || 0;
  const rem = Math.max(0, total - p10);
  const isHighGem = (p10 / total) > 0.25;
  const weights = isHighGem
    ? [0.55, 0.25, 0.10, 0.05, 0.025, 0.015, 0.006, 0.003, 0.001]
    : [0.42, 0.28, 0.14, 0.07, 0.04, 0.025, 0.015, 0.007, 0.003];
  const wSum = weights.reduce((a, b) => a + b, 0);
  const p9 = Math.round(rem * (weights[0] / wSum));
  const p8 = Math.round(rem * (weights[1] / wSum));
  const p7 = Math.round(rem * (weights[2] / wSum));
  const p6 = Math.round(rem * (weights[3] / wSum));
  const p5 = Math.round(rem * (weights[4] / wSum));
  const p4 = Math.round(rem * (weights[5] / wSum));
  const p3 = Math.round(rem * (weights[6] / wSum));
  const p2 = Math.round(rem * (weights[7] / wSum));
  const p1 = Math.max(0, rem - (p9 + p8 + p7 + p6 + p5 + p4 + p3 + p2));

  return [
    { grade: 'PSA 10', label: 'Gem Mint', pop: p10, rate: ((p10 / total) * 100).toFixed(1), color: '#3FCF8E', highlight: c.grade === 10 },
    { grade: 'PSA 9', label: 'Mint', pop: p9, rate: ((p9 / total) * 100).toFixed(1), color: '#72E3AD', highlight: c.grade === 9 },
    { grade: 'PSA 8', label: 'NM-MT', pop: p8, rate: ((p8 / total) * 100).toFixed(1), color: '#F3BA63', highlight: c.grade === 8 },
    { grade: 'PSA 7', label: 'Near Mint', pop: p7, rate: ((p7 / total) * 100).toFixed(1), color: '#DC7B18', highlight: c.grade === 7 },
    { grade: 'PSA 6', label: 'EX-MT', pop: p6, rate: ((p6 / total) * 100).toFixed(1), color: '#9CA3AF', highlight: c.grade === 6 },
    { grade: 'PSA 5', label: 'Excellent', pop: p5, rate: ((p5 / total) * 100).toFixed(1), color: '#9CA3AF', highlight: c.grade === 5 },
    { grade: 'PSA 4', label: 'VG-EX', pop: p4, rate: ((p4 / total) * 100).toFixed(1), color: '#9CA3AF', highlight: c.grade === 4 },
    { grade: 'PSA 3', label: 'Very Good', pop: p3, rate: ((p3 / total) * 100).toFixed(1), color: '#9CA3AF', highlight: c.grade === 3 },
    { grade: 'PSA 2', label: 'Good', pop: p2, rate: ((p2 / total) * 100).toFixed(1), color: '#9CA3AF', highlight: c.grade === 2 },
    { grade: 'PSA 1', label: 'Poor', pop: p1, rate: ((p1 / total) * 100).toFixed(1), color: '#9CA3AF', highlight: c.grade === 1 },
  ];
};
