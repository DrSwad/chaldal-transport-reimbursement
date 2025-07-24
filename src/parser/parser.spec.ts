import { parseInvoiceMailHtml } from './parser';
import { pathaoMailHtmlExample } from './pathaoMailHtmlExample';

describe('parser', () => {
  it('parser parses correctly', async () => {
    const actual = parseInvoiceMailHtml(pathaoMailHtmlExample);
    const expected = {
      date: 'July 24, 2025',
      fare: '159.99',
      startTime: '09:24 AM',
      startAddress: 'Bangla Motor Foot Over Bridge',
      endTime: '09:59 AM',
      endAddress: 'Chaldal Ltd, Block F, Banani',
    };
    expect(actual).toEqual(expected);
  });
});
