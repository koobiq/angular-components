import { Platform } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

/**
 * @deprecated Nothing in the library uses it. Measure the scrollbar of the element that scrolls instead:
 * `element.offsetWidth - element.clientWidth`. Will be removed in 22.0.0.
 */
@Injectable({ providedIn: 'root' })
export class KbqMeasureScrollbarService {
    protected readonly document = inject<Document>(DOCUMENT);
    private readonly platform = inject(Platform);

    get scrollBarWidth(): number {
        if (this._scrollBarWidth) {
            return this._scrollBarWidth;
        }

        this.initScrollBarWidth();

        return this._scrollBarWidth;
    }

    private _scrollBarWidth!: number;
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
        if (!this.platform.isBrowser) {
            this._scrollBarWidth = 0;

            return;
        }

        const scrollDiv = this.document.createElement('div');

        for (const scrollProp in this.scrollbarMeasure) {
            if (this.scrollbarMeasure.hasOwnProperty(scrollProp)) {
                const key = scrollProp as keyof typeof this.scrollbarMeasure;

                scrollDiv.style[key] = this.scrollbarMeasure[key];
            }
        }

        this.document.body.appendChild(scrollDiv);

        const width = scrollDiv.offsetWidth - scrollDiv.clientWidth;

        this.document.body.removeChild(scrollDiv);
        this._scrollBarWidth = width;
    }
}
