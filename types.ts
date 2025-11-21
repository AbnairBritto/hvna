export interface RawExcelRow {
  "NOME DA LOJA": string;
  "META SELL-IN": number | string;
  "VL. SELL-IN": number | string;
  "% IN": number | string;
  "META SELL-OUT": number | string;
  "VL. SELL-OUT": number | string;
  "% OUT": number | string;
  "% HVN": number | string;
  "TC": number | string;
  "TM": number | string;
  "VL. IFOOD": number | string;
}

export interface StoreData {
  id: string;
  name: string;
  metaSellIn: number;
  vlSellIn: number;
  pctIn: number;
  metaSellOut: number;
  vlSellOut: number;
  pctOut: number;
  pctHvn: number;
  tc: number;
  tm: number;
  vlIfood: number;
  quartile: 1 | 2 | 3 | 4;
}

export interface DashboardMetrics {
  totalSellIn: number;
  totalSellOut: number;
  avgTicket: number;
  storesCount: number;
  zeroSellInCount: number;
}
