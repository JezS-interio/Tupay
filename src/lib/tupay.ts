import { createHmac, randomUUID } from 'crypto';

const API_KEY = process.env.TUPAY_API_KEY!;
const API_SIGNATURE = process.env.TUPAY_API_SIGNATURE!;
const BASE_URL = process.env.TUPAY_BASE_URL || 'https://api-stg.tupayonline.com';

export function buildDepositHeaders(jsonPayload: string): Record<string, string> {
  const xDate = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const message = xDate + API_KEY + jsonPayload;
  const hash = createHmac('sha256', API_SIGNATURE).update(message).digest('hex');

  return {
    'Content-Type': 'application/json',
    'X-Login': API_KEY,
    'X-Date': xDate,
    'Authorization': `TUPAY ${hash}`,
    'X-Idempotency-Key': randomUUID(),
  };
}

export function buildGetDepositHeaders(): Record<string, string> {
  const xDate = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const message = xDate + API_KEY + '';
  const hash = createHmac('sha256', API_SIGNATURE).update(message).digest('hex');

  return {
    'Content-Type': 'application/json',
    'X-Login': API_KEY,
    'X-Date': xDate,
    'Authorization': `TUPAY ${hash}`,
  };
}

export async function createDeposit(payload: object): Promise<{ redirect_url: string; deposit_id: number }> {
  const jsonPayload = JSON.stringify(payload);
  const headers = buildDepositHeaders(jsonPayload);

  const res = await fetch(`${BASE_URL}/v3/deposits`, {
    method: 'POST',
    headers,
    body: jsonPayload,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Tupay error ${res.status}: ${error}`);
  }

  return res.json();
}

export async function getDepositStatus(depositId: number): Promise<{ status: string; invoice_id: string }> {
  const headers = buildGetDepositHeaders();

  const res = await fetch(`${BASE_URL}/v3/deposits/${depositId}`, {
    method: 'GET',
    headers,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Tupay status error ${res.status}: ${error}`);
  }

  return res.json();
}
