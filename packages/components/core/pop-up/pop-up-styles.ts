import { Renderer2 } from '@angular/core';

export const applyPopupMargins = (renderer: Renderer2, element: HTMLElement, name: string, value: string) => {
    const classList = element.classList;

    if (
        classList.contains(`${name}_placement-top`) ||
        classList.contains(`${name}_placement-top-left`) ||
        classList.contains(`${name}_placement-top-right`)
    ) {
        renderer.setStyle(element, 'margin-bottom', value);
    }

    if (
        classList.contains(`${name}_placement-right`) ||
        classList.contains(`${name}_placement-right-top`) ||
        classList.contains(`${name}_placement-right-bottom`)
    ) {
        renderer.setStyle(element, 'margin-left', value);
    }

    if (
        classList.contains(`${name}_placement-bottom`) ||
        classList.contains(`${name}_placement-bottom-left`) ||
        classList.contains(`${name}_placement-bottom-right`)
    ) {
        renderer.setStyle(element, 'margin-top', value);
    }

    if (
        classList.contains(`${name}_placement-left`) ||
        classList.contains(`${name}_placement-left-top`) ||
        classList.contains(`${name}_placement-left-bottom`)
    ) {
        renderer.setStyle(element, 'margin-right', value);
    }
};
