import * as dotenv from 'dotenv';
dotenv.config();

import { fetchInvoices } from '@/fetchInvoices';

async function main() {
  const from = new Date('2025-06-25');
  const to = new Date('2025-06-30');

  try {
    await fetchInvoices(from, to);
  } catch (error) {
    console.error('Error fetching invoices:', error);
  }
}

main().catch(console.error);
