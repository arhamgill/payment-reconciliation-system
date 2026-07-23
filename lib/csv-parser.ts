import Papa from 'papaparse';

export interface ParsedTransaction {
  transaction_id: string;
  amount: number;
  currency: string;
  transaction_date: string; // format: YYYY-MM-DD
  description: string;
  status: string;
}

export function parseCsvBuffer(buffer: Buffer): ParsedTransaction[] {
  const text = buffer.toString('utf8');
  const result = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, '_'),
  });

  if (result.errors.length > 0) {
    throw new Error(`CSV parse error: ${result.errors[0].message}`);
  }

  if (!result.data || result.data.length === 0) {
    throw new Error('CSV file is empty');
  }

  const required = ['transaction_id', 'amount', 'currency', 'transaction_date'];
  const headers = Object.keys(result.data[0] ?? {});
  for (const col of required) {
    if (!headers.includes(col)) {
      throw new Error(`Missing required column: "${col}"`);
    }
  }

  return result.data.map((row) => ({
    transaction_id: row.transaction_id?.trim() ?? '',
    amount: parseFloat(row.amount ?? '0'),
    currency: row.currency?.trim().toUpperCase() ?? 'USD',
    transaction_date: row.transaction_date?.trim() ?? '',
    description: row.description?.trim() ?? '',
    status: row.status?.trim() ?? '',
  }));
}
