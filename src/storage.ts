import fs from 'fs/promises';
import process from 'process';
import path from 'path';

const STORAGE_PATH = path.join(process.cwd(), 'storage');
const EMAILS_PATH = path.join(STORAGE_PATH, 'emails');

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
