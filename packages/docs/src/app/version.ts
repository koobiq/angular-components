import { VERSION } from '@koobiq/components/core';

export const koobiqVersion = VERSION.full.match(/(\d+\.\d+\.\d+(?:[^\+]*))/)![1];
export const koobiqVersionFull = VERSION;
