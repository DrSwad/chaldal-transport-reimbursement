import * as cheerio from 'cheerio';

export const parseInvoiceEmail = (
  mailHtml: string,
): {
  date: string;
  fare: string;
  startTime: string;
  startAddress: string;
  endTime: string;
  endAddress: string;
} => {
  const $ = cheerio.load(mailHtml);
  const invoiceContainer = $('.details-area');
  const date = invoiceContainer.find('.service-date').text().trim();
  const fare = invoiceContainer
    .find('.service-info-right-area')
    .text()
    .trim()
    .substring(1);
  const startTime = invoiceContainer
    .find('.address-pickup-area .time')
    .text()
    .trim();
  const startAddress = invoiceContainer
    .find('.address-pickup-area .address')
    .text()
    .trim();
  const endTime = invoiceContainer
    .find('.address-dest-area .time')
    .text()
    .trim();
  const endAddress = invoiceContainer
    .find('.address-dest-area .address')
    .text()
    .trim();
  return {
    date,
    fare,
    startTime,
    startAddress,
    endTime,
    endAddress,
  };
};
