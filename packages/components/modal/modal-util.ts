import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

export interface IClickPosition {
    x: number;
    y: number;
}

@Injectable()
export class ModalUtil {
    private lastPosition: IClickPosition;
    private readonly document = inject(DOCUMENT);

    constructor() {
        this.lastPosition = { x: -1, y: -1 };
        this.listenDocumentClick();
    }

    getLastClickPosition(): IClickPosition {
        return this.lastPosition;
    }

    listenDocumentClick(): void {
        this.document.addEventListener('click', (event: MouseEvent) => {
            this.lastPosition = { x: event.clientX, y: event.clientY };
        });
    }
}
