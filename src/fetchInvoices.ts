import { google } from 'googleapis';
import { authorize } from '@/gmail';
import { OAuth2Client } from 'google-auth-library';
import { parseInvoiceEmail } from '@/parseInvoiceEmail';

async function fetchEmails(
  auth: OAuth2Client,
  startDate: Date,
  endDate: Date,
  senderEmail: string,
  subject: string,
  bodyIncludes: string,
) {
  const gmail = google.gmail({ version: 'v1', auth });

  const res = await gmail.users.messages.list({
    userId: 'me',
    q: `from:(${senderEmail}) subject:(${subject}) after:${
      startDate.getTime() / 1000
    } AND before:${endDate.getTime() / 1000} ${bodyIncludes}`,
    maxResults: 100,
  });

  let mails = res.data.messages || [];
  mails = mails.slice(0, 1);

  const mailIdToHtmls: {
    [key: string]: string;
  } = {};

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

    const encodedHtmlPayload =
      res?.data?.payload?.parts?.find((part) => part.mimeType === 'text/html')
        ?.body?.data || res?.data?.payload?.body?.data;

    if (encodedHtmlPayload) {
      const decodedHtmlPayload = Buffer.from(
        encodedHtmlPayload,
        'base64',
      ).toString('utf-8');
      mailIdToHtmls[mail.id] = decodedHtmlPayload;
    } else {
      console.log('No HTML payload found in this message');
    }
  }

  return mailIdToHtmls;
}

export async function fetchInvoices(startDate: Date, endDate: Date) {
  const auth = await authorize();

  const pathaoEmails = await fetchEmails(
    auth,
    startDate,
    endDate,
    'no-reply@pathao.com',
    'Your * Pathao trip!',
    'Thank you for riding',
  );

  const uberEmails = await fetchEmails(
    auth,
    startDate,
    endDate,
    'noreply@uber.com',
    'Your * trip with Uber',
    'Thanks for riding',
  );

  const pathaoInvoices = Object.entries(pathaoEmails).map(
    ([emailId, mailHtml]) => parseInvoiceEmail(emailId, mailHtml, 'Pathao'),
  );

  const uberInvoices = Object.entries(uberEmails).map(([emailId, mailHtml]) =>
    parseInvoiceEmail(emailId, mailHtml, 'Uber'),
  );

  const invoices = [...pathaoInvoices, ...uberInvoices].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime(),
  );

  return invoices;
}
