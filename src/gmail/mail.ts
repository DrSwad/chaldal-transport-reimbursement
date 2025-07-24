import fs from 'fs/promises';
import path from 'path';
import process from 'process';
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';
import nodeHtmlToImage from 'node-html-to-image';
import cheerio from 'cheerio';
import { OAuth2Client } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

async function loadSavedCredentialsIfExist(): Promise<OAuth2Client | null> {
  try {
    const content = (await fs.readFile(TOKEN_PATH)).toString();
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials) as OAuth2Client;
  } catch (err) {
    return null;
  }
}

async function saveCredentials(client: OAuth2Client): Promise<void> {
  const content = (await fs.readFile(CREDENTIALS_PATH)).toString();
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

async function authorize() {
  let client = await loadSavedCredentialsIfExist();

  if (client) {
    return client;
  }

  client = (await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  })) as any as OAuth2Client;

  if (!client) {
    throw new Error('Failed to create client');
  }

  await saveCredentials(client);

  return client;
}

async function fetchInvoices(from: Date, to: Date) {
  const auth = await authorize();

  const gmail = google.gmail({ version: 'v1', auth });

  const res = await gmail.users.messages.list({
    userId: 'me',
    q: `from:no-reply@pathao.com AND after:${
      from.getTime() / 1000
    } AND before:${to.getTime() / 1000}`,
    maxResults: 100,
  });

  let mails = res.data.messages;
  if (!mails || mails.length === 0) {
    console.log('No mails found.');
    return;
  }

  console.log('Mails:');
  mails = mails.slice(0, 1);
  for (const mail of mails) {
    if (!mail.id) {
      console.log('Skipping mail with no ID');
      continue;
    }
    const res = await gmail.users.messages.get({
      userId: 'me',
      id: mail.id,
      format: 'full',
    });

    const encodedHtmlPayload = res?.data?.payload?.parts?.find(
      (part) => part.mimeType === 'text/html',
    )?.body?.data;

    if (encodedHtmlPayload) {
      const decodedHtmlPayload = Buffer.from(
        encodedHtmlPayload,
        'base64',
      ).toString('utf-8');
      console.log(`- ${decodedHtmlPayload}`);
    } else {
      console.log('No HTML payload found in this message');
    }
  }
}
