import { Platform } from '@angular/cdk/platform';
import { Directive, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { KBQ_WINDOW } from '../tokens';
import { kbqInjectNativeElement } from '../utils';

@Directive({
    host: {
        '[class.kbq-expanded]': '!collapsed',
        '[class.kbq-collapsed]': 'collapsed'
    }
})
export class KbqRectangleItem {
    protected readonly isBrowser = inject(Platform).isBrowser;
    protected readonly nativeElement = kbqInjectNativeElement();
    private readonly window = inject(KBQ_WINDOW);

    readonly state = new Subject<void>();

    get collapsed(): boolean {
        return this._collapsed;
    }

    set collapsed(value: boolean) {
        this._collapsed = value;

        this.state.next();
    }

    private _collapsed: boolean;

    /**
     * Outer width of the item: its border box plus horizontal margins.
     *
     * `getComputedStyle().width` resolves to the used content-box width whatever `box-sizing` says,
     * so it silently drops padding and borders on the `border-box` elements this measures, and the
     * result would change again under a consuming application's global reset.
     * `getBoundingClientRect()` is always the border box, which makes it host-independent.
     */
    getOuterElementWidth(): number {
        if (!this.isBrowser) return 0;

        const { marginLeft, marginRight } = this.window.getComputedStyle(this.nativeElement);

        return [marginLeft, marginRight].reduce(
            (acc, item) => acc + (parseFloat(item) || 0),
            this.nativeElement.getBoundingClientRect().width
        );
    }
}
