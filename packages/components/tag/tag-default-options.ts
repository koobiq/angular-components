import { InjectionToken } from '@angular/core';

import { KbqTagSeparator } from './tag-input';


/** Default options, for the chips module, that can be overridden. */
// tslint:disable-next-line: naming-convention
export interface KbqTagDefaultOptions {
    /** The list of key codes that will trigger a chipEnd event. */
    separatorKeyCodes: number[];
    separators?: { [key: number]: KbqTagSeparator };
}

/** Injection token to be used to override the default options for the chips module. */
export const KBQ_TAG_DEFAULT_OPTIONS = new InjectionToken<KbqTagDefaultOptions>('kbq-tag-default-options');
