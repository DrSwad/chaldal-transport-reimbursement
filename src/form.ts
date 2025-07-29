import { chromium } from 'playwright';
import path from 'path';
import process from 'process';
import { Invoice } from '@/types/Invoice';
import { getScreenshotPath, saveSubmission } from '@/storage';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const formUrl = process.env.FORM_URL as string;
const STORAGE_PATH = path.join(process.cwd(), 'storage');
const AUTH_CONTEXT_PATH = path.join(STORAGE_PATH, '.auth');

export async function authenticate() {
  const browser = await chromium.launch({
    headless: false,
  });

  const page = await browser.newPage();
  await page.goto(formUrl);

  await page.getByText('Employee Transportation Reimbursement').waitFor({
    state: 'visible',
    timeout: 0,
  });

  await page.context().storageState({ path: AUTH_CONTEXT_PATH });

  await browser.close();
}

export async function isAuthenticated() {
  if (!fs.existsSync(AUTH_CONTEXT_PATH)) {
    return false;
  }

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    storageState: AUTH_CONTEXT_PATH,
  });

  const page = await context.newPage();
  await page.goto(formUrl);

  try {
    await page.getByText('Employee Transportation Reimbursement').waitFor({
      state: 'visible',
      timeout: 10000,
    });
    return true;
  } catch (error) {
    return false;
  } finally {
    await browser.close();
  }
}

export async function fillUpForm(invoice: Invoice) {
  const browser = await chromium.launch({
    headless: false,
  });

  const context = await browser.newContext({
    storageState: AUTH_CONTEXT_PATH,
  });

  const page = await context.newPage();
  await page.goto(formUrl);

  const dateInputElement = await page.getByRole('combobox', { name: 'Date' });
  const dateInputFormat = await dateInputElement.getAttribute('placeholder');
  const invoiceDateFormatted = dateInputFormat?.toLowerCase()?.includes('dd/mm')
    ? `${invoice.startTime.getDate()}/${invoice.startTime.getMonth() + 1}/${invoice.startTime.getFullYear()}`
    : `${invoice.startTime.getMonth() + 1}/${invoice.startTime.getDate()}/${invoice.startTime.getFullYear()}`;
  await dateInputElement.fill(invoiceDateFormatted);

  await page
    .getByRole('textbox', { name: 'Total Cost' })
    .fill(invoice.fare.toString());

  await page
    .locator('input[type="file"]')
    .setInputFiles(`./${getScreenshotPath(invoice.emailId, true)}`);

  await page.getByText('Your response was submitted.').waitFor({
    state: 'visible',
    timeout: 0,
  });

  await saveSubmission(invoice.emailId);

  await browser.close();
}
