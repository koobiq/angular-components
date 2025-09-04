import { ElementRef, inject } from '@angular/core';

export const kbqInjectElement = <T = HTMLElement>(): T => {
    return inject(ElementRef).nativeElement;
};
