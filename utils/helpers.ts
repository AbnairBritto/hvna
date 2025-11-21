import { RawExcelRow, StoreData } from '../types';

export const parseCurrency = (value: string | number | undefined): number => {
  if (value === undefined || value === null) return 0;
  if (typeof value === 'number') return value;
  
  // Remove currency symbols, spaces, and handle Brazilian format (1.000,00)
  // Remove R$, spaces, and dots (thousand separators)
  let cleanString = value.toString().replace(/[R$\s.]/g, '');
  // Replace comma with dot for decimal
  cleanString = cleanString.replace(',', '.');
  
  const parsed = parseFloat(cleanString);
  return isNaN(parsed) ? 0 : parsed;
};

export const determineQuartile = (sellOut: number): 1 | 2 | 3 | 4 => {
  if (sellOut <= 50000) return 1;
  if (sellOut <= 80000) return 2;
  if (sellOut <= 100000) return 3;
  return 4;
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const processExcelData = (rawData: RawExcelRow[]): StoreData[] => {
  return rawData.map((row, index) => {
    const vlSellOut = parseCurrency(row["VL. SELL-OUT"]);
    
    return {
      id: `store-${index}`,
      name: row["NOME DA LOJA"] || `Loja ${index + 1}`,
      metaSellIn: parseCurrency(row["META SELL-IN"]),
      vlSellIn: parseCurrency(row["VL. SELL-IN"]),
      pctIn: parseCurrency(row["% IN"]), // Assuming percentage comes as number or parsable string
      metaSellOut: parseCurrency(row["META SELL-OUT"]),
      vlSellOut: vlSellOut,
      pctOut: parseCurrency(row["% OUT"]),
      pctHvn: parseCurrency(row["% HVN"]),
      tc: parseCurrency(row["TC"]),
      tm: parseCurrency(row["TM"]),
      vlIfood: parseCurrency(row["VL. IFOOD"]),
      quartile: determineQuartile(vlSellOut)
    };
  });
};