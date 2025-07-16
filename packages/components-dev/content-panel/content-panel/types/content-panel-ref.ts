import { ElementRef } from '@angular/core';
import { KbqSidepanelRef } from '@koobiq/components/sidepanel';

export type IcContentPanelRef<T = any, R = any> = KbqSidepanelRef<T, R> & {
    elementRef: ElementRef;
};
