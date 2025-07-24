import { google } from 'googleapis';
import { authorize } from 'gmail';

export async function fetchInvoices(from: Date, to: Date) {
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
