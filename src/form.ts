import { chromium } from 'playwright';
import path from 'path';
import process from 'process';

const formUrl = 'https://forms.office.com/r/xWfwuqbg02';
const STORAGE_PATH = path.join(process.cwd(), 'storage');
const AUTH_CONTEXT_PATH = path.join(STORAGE_PATH, '.auth');

export async function authenticate() {
  const browser = await chromium.launch({
    headless: false,
  });

  const page = await browser.newPage();
  await page.goto(formUrl);

  console.log('Waiting for form title to appear...');

  await page.waitForSelector('#FormTitleId_titleAriaId', {
    state: 'visible',
    timeout: 0,
  });

  console.log('Form title is visible, saving context...');

  await page.context().storageState({ path: AUTH_CONTEXT_PATH });

  await browser.close();
}

export async function checkAuthentication() {
  const browser = await chromium.launch({
    headless: false,
  });

  const context = await browser.newContext({
    storageState: AUTH_CONTEXT_PATH,
  });

  const page = await context.newPage();
  await page.goto(formUrl);

  const isAuthenticated = await page.isVisible('#FormTitleId_titleAriaId');

  if (isAuthenticated) {
    console.log('User is authenticated');
  } else {
    console.log('User is not authenticated');
  }

  await browser.close();
}

export async function fillUpForm() {
  const browser = await chromium.launch({
    headless: false,
  });

  const context = await browser.newContext({
    storageState: AUTH_CONTEXT_PATH,
  });

  const page = await context.newPage();
  await page.goto(formUrl);

  await page
    .getByRole('combobox', { name: 'DateRequired to answer' })
    .fill('27/07/2024');
  await page
    .getByRole('textbox', { name: '2. Total Cost (in TK)Required' })
    .fill('150');
  await page.locator('input[type="file"]').setInputFiles('./example.png');

  await new Promise((resolve) => setTimeout(resolve, 300000));

  await browser.close();
}
