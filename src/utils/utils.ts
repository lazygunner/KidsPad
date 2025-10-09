/* eslint-disable @typescript-eslint/no-explicit-any */
export const getSelectItemList = (keyWord: string, list: any[] = [], keyName?: string): any[] => {
  if (!keyWord) {
    return list;
  }
  if (!Array.isArray(list)) {
    return [];
  }
  if (keyName) {
    return list.filter(item => `${item?.[keyName] ?? ''}`.includes(keyWord));
  }
  return list.filter(item => `${item ?? ''}`.includes(keyWord));
};

export const getToDate = (offset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return `${date.getFullYear()}-${getDateShowStr(date.getMonth() + 1)}-${getDateShowStr(date.getDate())}`;
};

export const getWeek1 = (y: number, m: number, d: number): string => {
  const date = new Date(y, m, d);
  date.setDate(date.getDate() - date.getDay() + 1);
  return `${getDateShowStr(date.getMonth() + 1)}${getDateShowStr(date.getDate())}`;
};

export const getWeek7 = (y: number, m: number, d: number): string => {
  const date = new Date(y, m, d);
  date.setDate(date.getDate() + 6);
  return `${getDateShowStr(date.getMonth() + 1)}${getDateShowStr(date.getDate())}`;
};

export const getDateShowStr = (value: number): string => (value < 10 ? `0${value}` : `${value}`);

export const getWeekNumber = (y: number, m: number, d: number): number => {
  const targetDay = new Date(y, m, d);
  const year = targetDay.getFullYear();
  let days = targetDay.getDate();
  for (let i = 1; i < m; i += 1) {
    days += getMonthDays(year, i);
  }
  const yearFirstDay = new Date(year, 0, 1).getDay();
  days += yearFirstDay;
  return Math.ceil(days / 7);
};

const isLeapYear = (year: number): boolean => (year % 400 === 0) || (year % 4 === 0 && year % 100 !== 0);

const getMonthDays = (year: number, month: number): number =>
  [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];

export const getTimeIntervalDays = (time1?: number, time2?: number): number => {
  if (!time1 || !time2) {
    return -1;
  }
  return Math.trunc((time2 - time1) / (1000 * 24 * 60 * 60));
};

export const getYears = (): string[] => {
  const date = new Date();
  const currentYear = date.getFullYear();
  const years: string[] = ['全部'];
  for (let index = 0; index < 5; index += 1) {
    years.push(`${currentYear - index}`);
  }
  return years;
};

export const getResultStr = (dataList: any[], fieldName?: string): string => {
  if (!Array.isArray(dataList)) {
    return '';
  }
  return dataList.reduce((acc: string, item: any) => {
    const value = fieldName ? item?.[fieldName] : item;
    if (value === undefined || value === null || value === '') {
      return acc;
    }
    return acc ? `${acc},${value}` : `${value}`;
  }, '');
};

export const getResultIdStr = (
  dataList: Array<Record<string, any>>,
  dataFieldName: string,
  oldDataList: Array<Record<string, any>>,
  oldFieldName: string,
): string => {
  if (!Array.isArray(dataList) || !Array.isArray(oldDataList)) {
    return '';
  }
  return dataList.reduce((acc: string, item: Record<string, any>) => {
    const index = item?.[dataFieldName];
    const value = oldDataList[index]?.[oldFieldName];
    if (value === undefined || value === null) {
      return acc;
    }
    return acc ? `${acc},${value}` : `${value}`;
  }, '');
};
