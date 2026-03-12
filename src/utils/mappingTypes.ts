export interface MappingData {
  mapping: Record<string, string>;
  unmatched?: Array<{ imageId: string; text?: string; error?: string }>;
  stats?: {
    total: number;
    matched: number;
    unmatched: number;
  };
  provider?: string;
  date?: string;
}

export interface LocalMapping {
  mapping: Record<string, string>;
  specialImages?: Record<string, string | null>;
  notes?: string;
  generatedAt?: string;
}
