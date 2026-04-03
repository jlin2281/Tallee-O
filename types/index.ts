export type SplitMode = "equal" | "exact" | "percentage";

export interface Person {
  id: string;
  name: string;
  color: string;
}

export interface ItemAllocation {
  personId: string;
  mode: SplitMode;
  value: number; // cents for exact, integer 0-100 for percentage
}

export interface ReceiptItem {
  id: string;
  name: string;
  priceCents: number;
  taxed: boolean;
  allocations: ItemAllocation[];
  discountType?: '%' | '$';
  discountValue?: number; // percentage (0-100) or cents
}

export type TipMode = "percentage" | "fixed";

export interface SplitSession {
  people: Person[];
  items: ReceiptItem[];
  taxRatePercent: number; // default 8
  tipMode: TipMode;
  tipValue: number; // percentage 0-100 or cents
  tipSplitMode: "equal" | "proportional"; // default "equal"
  taxSplitMode: "proportional" | "equal"; // default "proportional"
}

export interface PersonResult {
  personId: string;
  name: string;
  color: string;
  subtotalCents: number;
  taxCents: number;
  tipCents: number;
  totalCents: number;
  itemBreakdown: { itemId: string; name: string; shareCents: number }[];
}

export interface ItemResult {
  itemId: string;
  name: string;
  priceCents: number;
  taxed: boolean;
  splitMode: SplitMode;
  personShares: { personId: string; name: string; color: string; shareCents: number }[];
}

export interface SettlementTransaction {
  fromPersonId: string;
  fromName: string;
  fromColor: string;
  toPersonId: string;
  toName: string;
  toColor: string;
  amountCents: number;
}

export interface CalculationResult {
  personResults: PersonResult[];
  itemResults: ItemResult[];
  settlements: SettlementTransaction[];
  totalSubtotalCents: number;
  totalTaxCents: number;
  totalTipCents: number;
  grandTotalCents: number;
  payerId?: string;
}
