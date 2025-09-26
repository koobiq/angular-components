import { ElementRef, inject } from '@angular/core';

/**
 * Injects the native element for the current component.
 */
export const kbqInjectNativeElement = <T extends Element = HTMLElement>(): T => {
    return inject<ElementRef<T>>(ElementRef<T>).nativeElement;
};
