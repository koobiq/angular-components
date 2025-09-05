import { ElementRef, inject } from '@angular/core';

/**
 * Injects the ElementRef for the current component.
 */
export const kbqInjectElementRef = <T = HTMLElement>(): ElementRef<T> => {
    return inject<ElementRef<T>>(ElementRef<T>);
};

/**
 * Injects the native element for the current component.
 */
export const kbqInjectNativeElement = <T = HTMLElement>(): T => {
    return kbqInjectElementRef<T>().nativeElement;
};
