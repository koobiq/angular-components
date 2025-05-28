import { VERSION } from '@koobiq/components/core';

export const docsKoobiqVersion = VERSION.full.match(/(\d+\.\d+\.\d+(?:[^\+]*))/)![1];
export const docsKoobiqVersionFull = VERSION;
