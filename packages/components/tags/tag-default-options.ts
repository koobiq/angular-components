import { InjectionToken } from '@angular/core';
import { KbqTagSeparator } from './tag-input';

/** Default options, for the chips module, that can be overridden. */
export interface KbqTagsDefaultOptions {
    /** The list of key codes that will trigger a chipEnd event. */
    separatorKeyCodes: number[];
    separators?: { [key: number]: KbqTagSeparator };
    addOnPaste?: boolean;
}

/** Injection token to be used to override the default options for the chips module. */
export const KBQ_TAGS_DEFAULT_OPTIONS = new InjectionToken<KbqTagsDefaultOptions>('kbq-tags-default-options');
