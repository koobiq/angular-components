import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class KbqMeasureScrollbarService {
    protected readonly document = inject<Document>(DOCUMENT);

    get scrollBarWidth(): number {
        if (this._scrollBarWidth) {
            return this._scrollBarWidth;
        }
        this.initScrollBarWidth();

        return this._scrollBarWidth;
    }

    private _scrollBarWidth: number;
    private scrollbarMeasure = {
        position: 'absolute',
        top: '-9999px',
        width: '50px',
        height: '50px',
        overflow: 'scroll'
    };

    constructor() {
        this.initScrollBarWidth();
    }

    initScrollBarWidth() {
        const scrollDiv = this.document.createElement('div');

        for (const scrollProp in this.scrollbarMeasure) {
            if (this.scrollbarMeasure.hasOwnProperty(scrollProp)) {
                scrollDiv.style[scrollProp] = this.scrollbarMeasure[scrollProp];
            }
        }

        this.document.body.appendChild(scrollDiv);

        const width = scrollDiv.offsetWidth - scrollDiv.clientWidth;

        this.document.body.removeChild(scrollDiv);
        this._scrollBarWidth = width;
    }
}
