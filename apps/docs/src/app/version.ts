import { Version } from '@angular/core';
import { VERSION } from '@koobiq/components/core';

const version = VERSION.full === '{{VERSION}}' ? new Version('0.0.0') : VERSION;

export const docsKoobiqVersion = version.full.match(/(\d+\.\d+\.\d+(?:[^\+]*))/)![1];
