import { ElementRef, InjectionToken } from '@angular/core';

/** @docs-private */
export interface KbqTitleTextRef {
    textElement?: ElementRef;
    parentTextElement?: ElementRef;
}

/** @docs-private */
export const KBQ_TITLE_TEXT_REF = new InjectionToken<KbqTitleTextRef>('KbqTitleTextRef');
