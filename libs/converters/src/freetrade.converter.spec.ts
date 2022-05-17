import { asExportTemplateFx, MergedData } from './freetrade.converter';

test('valid item can be convertedd', async () => {
  const input: MergedData[] = [{ id: 'test', RAW: 'anytext' }];
  const result = await asExportTemplateFx(input);
  expect(result.length).toBe(1);
  expect(result[0]).toMatchObject({
    Currency: '',
    Date: '',
    DoNotAdjustCash: '',
    Error: '{"id":"test","RAW":"anytext"}',
    Event: '',
    Exchange: '',
    FeeCurrency: '',
    FeeTax: 0,
    NKD: '',
    Price: 0,
    Quantity: 0,
    Symbol: '',
  });
});
