export interface PokemonCard {
  id: string;
  name: string;
  character: string;
  year: number;
  set: string;
  variant: string;
  grade: number;
  gradeLabel?: string;
  slabCompany: 'PSA' | 'BGS' | 'CGC' | string;
  tierScore?: number | null;
  pricecharting?: number | null;
  manualPrice?: number | null;
  listingPriceUSD?: number | null;
  psa10pop?: number | null;
  psaTotal?: number | null;
  priceChartingUrl?: string;
  ebayQuery?: string;
  image?: string;
  origin?: string;
  researched?: boolean;
  notes?: string;
  investmentThesis?: string;
  seller?: string;
  sellerHref?: string;
  sellerBadge?: string;
  sellerTransactions?: number;
  sellerFeedback?: number;
  isPowerSeller8k?: boolean;
  listingUrl?: string;
  listingTitle?: string;
  listingType?: string;
  bids?: number;
  ebayItemUrl?: string;
  ebayItemTitle?: string;
  ebayItemPrice?: number | null;
  manualUrl?: string;
  favorite?: boolean;
  tier?: TierLevel;
  diffPercent?: number | null;
  priceDiffUSD?: number | null;
  dealRating?: string;
}

export type TierLevel = 'ALL' | 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

export type Currency = 'VND' | 'USD';

export type SortOption =
  | 'score'
  | 'pc_desc'
  | 'pc_asc'
  | 'price_desc'
  | 'price_asc'
  | 'deal'
  | 'scarcity'
  | 'seller_rep'
  | 'year_old'
  | 'year_new';

export interface LiveItem {
  price: number;
  currency: string;
  title: string;
  url: string;
  ship?: number | null;
  manual?: boolean;
}

export interface LiveCardData {
  items: LiveItem[];
  time?: string;
}
