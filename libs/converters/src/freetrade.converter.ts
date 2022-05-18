/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createEffect, createEvent, sample } from 'effector';
import fileReaderStream from 'filereader-stream';
import parse from 'csv-parser';
import { excludeProp, NeverError } from '@freetrade/utils';
import { unparse } from 'papaparse';
import saveAs from 'file-saver';
import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import { showError } from '@freetrade/common/notify';

dayjs.extend(customParseFormat);

const processInputFile = createEvent<FileSystemFileEntry>();

const notifyErrorFx = createEffect((message: string) => {
  showError(message);
});

type RowContent = Record<string, unknown>;
type FileContent = RowContent[];
const readFileFx = createEffect(
  (entry: FileSystemFileEntry) =>
    new Promise<any>((resolve, reject) => {
      entry.file(async (file) => {
        try {
          const results: FileContent = [];
          fileReaderStream(file)
            .pipe(
              parse({
                skipLines: 1,
              })
            )
            .on('data', (row: any) => {
              results.push(excludeProp(row, ''));
            })
            .on('error', (ee: any) => {
              console.log('caught', ee);
            })
            .on('end', () => resolve(results));
        } catch (err: unknown) {
          reject(err instanceof Error ? err.message : err);
        }
      });
    })
);

type MergedData = Record<string, string> & { RAW: string };
const mergeIntoJson = createEffect((rawData: FileContent) =>
  rawData.reduce<MergedData[]>((acc, curr) => {
    acc.push({ ...curr, RAW: JSON.stringify(curr) });
    return acc;
  }, [])
);

sample({
  source: processInputFile,
  target: readFileFx,
});

sample({
  source: readFileFx.doneData,
  target: mergeIntoJson,
});

type EventType = 'Buy' | 'Sell' | 'Dividend' | 'Cash_In' | 'Cash_Out' | '';
type ExportTemplate = {
  Event: EventType;
  Date: string;
  Symbol: string;
  Price: number;
  Quantity: number;
  Currency: string;
  FeeTax: number;
  Exchange: string;
  NKD: string;
  FeeCurrency: string;
  DoNotAdjustCash: string;
  Error: string;
};

const toPositive = (input: number) => Math.abs(input);

const transformType = (row: MergedData): EventType => {
  const type = row['Type'];
  switch (type) {
    case 'BUY':
      return 'Buy';
    case 'SELL':
      return 'Sell';
    case 'INVESTMENT_INCOME':
      return 'Dividend';
    case 'DEPOSIT':
      return 'Cash_In';
    default:
      throw new Error(JSON.stringify(row));
  }
};

const transformPrice = (row: MergedData): number => {
  const actionType = transformType(row);
  switch (actionType) {
    case 'Buy':
    case 'Sell':
      //GBP 5.35914 on
      return +(row['Details']?.match(/@ GBP (\d*\.\d*) on/)?.[1] ?? 0);
    case 'Cash_In':
    case 'Cash_Out':
    case 'Dividend':
    case '':
      return 0;
    default:
      throw new NeverError(actionType);
  }
};

const transformQuantity = (row: MergedData): number => {
  const actionType = transformType(row);
  switch (actionType) {
    case 'Buy':
    case 'Sell':
      return +(getOrThrow(row, 'Details').split(' ')[0] ?? -999);
    case 'Cash_In':
    case 'Cash_Out':
    case 'Dividend':
      return toPositive(+getOrThrow(row, 'Value'));
    case '':
      return 0;
    default:
      throw new NeverError(actionType);
  }
};

const transformSymbol = (row: MergedData): string => {
  const actionType = transformType(row);
  switch (actionType) {
    case 'Buy':
    case 'Sell':
      return row['Details']?.match(/\(([^()]+)\) @ GBP/)?.[1] ?? 'UNKNOWN';
    case 'Cash_In':
    case 'Cash_Out':
      return getOrThrow(row, 'Currency');
    case 'Dividend':
      return row['Details']?.match(/\(([^()]+)\)$/)?.[1] ?? 'UNKNOWN';
    case '':
      return '';
    default:
      throw new NeverError(actionType);
  }
};
const asDate = (input: MergedData) => {
  return dayjs(getOrThrow(input, 'Value Date'), 'DD/MM/YYYY', true).format(
    'YYYY-MM-DD'
  );
};

const getOrThrow = (input: MergedData, key: string): string => {
  if (key in input) {
    return input[key] ?? 'MISSING';
  }

  throw new Error(`Missing key ${key} in ${JSON.stringify(input)}`);
};

const transformToExportTemplate = (input: MergedData): ExportTemplate => {
  try {
    return {
      Event: transformType(input),
      Date: asDate(input),
      Currency: getOrThrow(input, 'Currency'),
      FeeTax: 0, // TODO
      Price: transformPrice(input),
      Quantity: transformQuantity(input),
      Symbol: transformSymbol(input),
      Exchange: '',
      NKD: '',
      FeeCurrency: '',
      DoNotAdjustCash: '',
      Error: '',
    };
  } catch (err: unknown) {
    return {
      Event: '',
      Date: '',
      Currency: '',
      FeeTax: 0, // TODO
      Price: 0,
      Quantity: 0,
      Symbol: '',
      Exchange: '',
      NKD: '',
      FeeCurrency: '',
      DoNotAdjustCash: '',
      Error: err instanceof Error ? err.message : JSON.stringify(err),
    };
  }
};

const asExportTemplateFx = createEffect((rawData: MergedData[]) =>
  rawData.map((el) => transformToExportTemplate(el))
);

sample({
  source: mergeIntoJson.doneData,
  target: asExportTemplateFx,
});

const exportToCsv = createEffect((data: ExportTemplate[]) => {
  saveAs(
    new Blob(
      [
        unparse(data, {
          columns: [
            'Event',
            'Date',
            'Currency',
            'FeeTax',
            'Price',
            'Quantity',
            'Symbol',
            // 'Exchange',
            // 'NKD',
            // 'FeeCurrency',
            // 'DoNotAdjustCash',
            'Error',
          ],
        }),
      ],
      { type: 'text/plain;charset=utf-8' }
    ),
    'freetrade_portfolio.csv'
  );
});

sample({
  source: asExportTemplateFx.doneData,
  target: exportToCsv,
});

sample({
  clock: [
    readFileFx.failData,
    mergeIntoJson.failData,
    asExportTemplateFx.failData,
    exportToCsv.failData,
  ],
  fn: (_) => _.message,
  target: notifyErrorFx,
});

readFileFx.fail.watch((f) => console.log('readFileFx', f));
mergeIntoJson.fail.watch((f) => console.log('mergeIntoJson', f));
asExportTemplateFx.fail.watch((f) => console.log('asExportTemplateFx', f));
exportToCsv.fail.watch((f) => console.log('exportToCsv', f));

export { processInputFile, asExportTemplateFx, MergedData };
