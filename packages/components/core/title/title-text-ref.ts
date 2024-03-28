import { ElementRef, InjectionToken } from '@angular/core';


export interface KbqTitleTextRef {
    textElement?: ElementRef;
    parentTextElement?: ElementRef;
}

export const KBQ_TITLE_TEXT_REF = new InjectionToken<KbqTitleTextRef>('KbqTitleTextRef');
