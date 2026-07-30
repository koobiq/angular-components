import { Version } from '@angular/core';
import { VERSION } from '@koobiq/components/core';

/** Placeholder version used when the `{{VERSION}}` build-time token hasn't been replaced, i.e. in local dev builds. */
export const docsDevVersionPlaceholder = '0.0.0-dev';

const version = VERSION.full === '{{VERSION}}' ? new Version(docsDevVersionPlaceholder) : VERSION;

export const docsKoobiqVersion = version.full.match(/(\d+\.\d+\.\d+(?:[^\+]*))/)![1];
