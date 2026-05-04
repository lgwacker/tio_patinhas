export interface QuoteData {
  ticker: string;
  preco: number;
  fonte: 'yahoo' | 'brapi' | 'cache' | 'manual';
  updatedAt: Date;
}

export interface QuoteResult {
  success: boolean;
  data?: QuoteData;
  error?: string;
}

export interface QuoteCacheEntry {
  ticker: string;
  preco: number;
  updated_at: string;
}
