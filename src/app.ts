import express from 'express';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadSavedCredentialsIfExist, authorize } from '@/gmail';
import { isAuthenticated, authenticate, fillUpForm } from '@/form';
import { fetchInvoices, fetchInvoiceById } from '@/fetchInvoices';
import { getScreenshotPath, saveSubmission, removeSubmission } from '@/storage';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('.'));

app.get('/api/is-authenticated-to-gmail', async (req, res) => {
  return res.json({ data: (await loadSavedCredentialsIfExist()) !== null });
});

app.post('/api/authenticate-to-gmail', async (req, res) => {
  try {
    await authorize();
    return res.json({ data: true });
  } catch (error) {
    return res.status(500).json({
      error: `Google authentication failed. Details:\n${error}`,
    });
  }
});

app.get('/api/is-authenticated-to-microsoft-form', async (req, res) => {
  return res.json({ data: await isAuthenticated() });
});

app.post('/api/authenticate-to-microsoft-form', async (req, res) => {
  try {
    await authenticate();
    return res.json({ data: true });
  } catch (error) {
    return res.status(500).json({
      error: `Microsoft authentication failed. Details:\n${error}`,
    });
  }
});

app.get('/api/invoices', async (req, res) => {
  const fromDate = new Date(req.query.fromDate as string);
  const toDate = new Date(req.query.toDate as string);
  return res.json({ data: await fetchInvoices(fromDate, toDate) });
});

app.get('/api/invoice-screenshot', (req, res) => {
  return res.sendFile(getScreenshotPath(req.query.emailId as string));
});

app.post('/api/submit-invoice', async (req, res) => {
  const invoice = await fetchInvoiceById(req.body.emailId as string);
  await fillUpForm(invoice);
  return res.json({ data: true });
});

app.post('/api/mark-invoice-submitted', async (req, res) => {
  const emailId = req.body.emailId as string;
  await saveSubmission(emailId);
  return res.json({ data: true });
});

app.post('/api/unmark-invoice-submitted', async (req, res) => {
  const emailId = req.body.emailId as string;
  await removeSubmission(emailId);
  return res.json({ data: true });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
