import fs from 'fs/promises';
import process from 'process';
import path from 'path';
import nodeHtmlToImage from 'node-html-to-image';

const STORAGE_PATH = path.join(process.cwd(), 'storage');
const EMAILS_PATH = path.join(STORAGE_PATH, 'emails');
const SCREENSHOTS_PATH = path.join(STORAGE_PATH, 'screenshots');
const SUBMISSIONS_TRACKER_PATH = path.join(STORAGE_PATH, 'submissions.json');

export async function saveEmail(emailId: string, mailHtml: string) {
  await fs.mkdir(EMAILS_PATH, { recursive: true });
  await fs.writeFile(path.join(EMAILS_PATH, `${emailId}.html`), mailHtml);
}

export async function loadEmail(emailId: string): Promise<string | null> {
  try {
    const filePath = path.join(EMAILS_PATH, `${emailId}.html`);
    return await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    return null;
  }
}

export async function saveScreenshot(emailId: string, mailHtml: string) {
  await fs.mkdir(SCREENSHOTS_PATH, { recursive: true });
  await nodeHtmlToImage({
    output: path.join(SCREENSHOTS_PATH, `${emailId}.png`),
    html: mailHtml,
  });
}

export function getScreenshotPath(
  emailId: string,
  relative: boolean = false,
): string {
  if (relative) {
    return path.join('storage', 'screenshots', `${emailId}.png`);
  } else {
    return path.join(SCREENSHOTS_PATH, `${emailId}.png`);
  }
}

async function loadSubmissions(): Promise<Set<string>> {
  try {
    await fs.mkdir(STORAGE_PATH, { recursive: true });
    const data = await fs.readFile(SUBMISSIONS_TRACKER_PATH, 'utf-8');
    return new Set(JSON.parse(data));
  } catch (error) {
    return new Set<string>();
  }
}

export async function isInvoiceSubmitted(emailId: string): Promise<boolean> {
  const submissions = await loadSubmissions();
  return submissions.has(emailId);
}

export async function saveSubmission(emailId: string) {
  const submissions = await loadSubmissions();
  submissions.add(emailId);
  await fs.writeFile(
    SUBMISSIONS_TRACKER_PATH,
    JSON.stringify([...submissions]),
  );
}

export async function removeSubmission(emailId: string) {
  const submissions = await loadSubmissions();
  if (submissions.has(emailId)) {
    submissions.delete(emailId);
    await fs.writeFile(
      SUBMISSIONS_TRACKER_PATH,
      JSON.stringify([...submissions]),
    );
  }
}
