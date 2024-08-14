import { ElementRef, Renderer2 } from '@angular/core';

export const applyPopupMargins = (renderer: Renderer2, element: ElementRef, name: string, value: string) => {
    const classList = element.nativeElement.classList;

    if (
        classList.contains(`${name}_placement-top`) ||
        classList.contains(`${name}_placement-top-left`) ||
        classList.contains(`${name}_placement-top-right`)
    ) {
        renderer.setStyle(element.nativeElement, 'margin-bottom', value);
    }

    if (
        classList.contains(`${name}_placement-right`) ||
        classList.contains(`${name}_placement-right-top`) ||
        classList.contains(`${name}_placement-right-bottom`)
    ) {
        renderer.setStyle(element.nativeElement, 'margin-left', value);
    }

    if (
        classList.contains(`${name}_placement-bottom`) ||
        classList.contains(`${name}_placement-bottom-left`) ||
        classList.contains(`${name}_placement-bottom-right`)
    ) {
        renderer.setStyle(element.nativeElement, 'margin-top', value);
    }

    if (
        classList.contains(`${name}_placement-left`) ||
        classList.contains(`${name}_placement-left-top`) ||
        classList.contains(`${name}_placement-left-bottom`)
    ) {
        renderer.setStyle(element.nativeElement, 'margin-right', value);
    }
};
