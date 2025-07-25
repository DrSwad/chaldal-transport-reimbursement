import * as cheerio from 'cheerio';
import { Invoice } from '@/types/Invoice';
import { RideSharingService } from '@/types/RideSharingService';
import { isInvoiceSubmitted } from '@/storage';

const parsePathaoInvoiceEmail = async (
  emailId: string,
  mailHtml: string,
): Promise<Invoice> => {
  const $ = cheerio.load(mailHtml);
  const invoiceContainer = $('.details-area');
  const date = invoiceContainer.find('.service-date').text().trim();

  let fareStr = invoiceContainer.find('.service-info-right-area').text().trim();
  if (fareStr.startsWith('৳')) {
    fareStr = fareStr.substring(1);
  }
  const fare = parseFloat(fareStr);

  const startTime = new Date(
    date +
      ' ' +
      invoiceContainer.find('.address-pickup-area .time').text().trim() +
      ' +06:00',
  );

  const startAddress = invoiceContainer
    .find('.address-pickup-area .address')
    .text()
    .trim();

  const endTime = new Date(
    date +
      ' ' +
      invoiceContainer.find('.address-dest-area .time').text().trim() +
      ' +06:00',
  );
  if (endTime < startTime) {
    endTime.setDate(endTime.getDate() + 1);
  }

  const endAddress = invoiceContainer
    .find('.address-dest-area .address')
    .text()
    .trim();

  return {
    emailId,
    rideSharingService: 'Pathao',
    fare,
    startTime,
    startAddress,
    endTime,
    endAddress,
    submitted: await isInvoiceSubmitted(emailId),
  };
};

const parseUberInvoiceEmail = async (
  emailId: string,
  mailHtml: string,
): Promise<Invoice> => {
  const $ = cheerio.load(mailHtml);

  const date = $('.logo > table > tbody > tr > td > span:last-child')
    .text()
    .trim();

  let fareStr = $('.total_head:not(.fare_string)').text().trim();
  if (fareStr.startsWith('BDT')) {
    fareStr = fareStr.substring(3).trim();
  }
  const fare = parseFloat(fareStr);

  const startDetailsContainer = $(
    'table.t5of12 > tbody > tr > td > table > tbody > tr > td > table:first-child > tbody > tr > td:last-child table > tbody',
  );
  const endDetailsContainer = $(
    'table.t5of12 > tbody > tr > td > table > tbody > tr > td > table:last-child > tbody > tr > td:last-child table > tbody',
  );

  const startTime = new Date(
    date +
      ' ' +
      startDetailsContainer.find('> tr:first-child').text().trim() +
      ' +06:00',
  );

  const startAddress = startDetailsContainer
    .find('> tr:last-child')
    .text()
    .trim();

  const endTime = new Date(
    date +
      ' ' +
      endDetailsContainer.find('> tr:first-child').text().trim() +
      ' +06:00',
  );
  if (endTime < startTime) {
    endTime.setDate(endTime.getDate() + 1);
  }

  const endAddress = endDetailsContainer.find('> tr:last-child').text().trim();

  return {
    emailId,
    rideSharingService: 'Uber',
    fare,
    startTime,
    startAddress,
    endTime,
    endAddress,
    submitted: await isInvoiceSubmitted(emailId),
  };
};

export const parseInvoiceEmail = async (
  emailId: string,
  mailHtml: string,
  rideSharingService: RideSharingService,
): Promise<Invoice> => {
  switch (rideSharingService) {
    case 'Pathao':
      return await parsePathaoInvoiceEmail(emailId, mailHtml);
    case 'Uber':
      return await parseUberInvoiceEmail(emailId, mailHtml);
    default:
      throw new Error(
        `Unsupported ride sharing service: ${rideSharingService}`,
      );
  }
};

export const detectRideSharingService = (
  mailHtml: string,
): RideSharingService => {
  if (mailHtml.includes('pathao.com')) {
    return 'Pathao';
  }
  return 'Uber';
};
