import { VERSION } from '@koobiq/components/core';

// eslint-disable-next-line no-useless-escape
export const koobiqVersion = VERSION.full.match(/(\d+\.\d+\.\d+(?:[^\+]*))/)![1];
export const koobiqVersionFull = VERSION;
