import { Platform } from '@angular/cdk/platform';
import { Directive, ElementRef, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { KBQ_WINDOW } from '../tokens';

@Directive({
    standalone: true,
    host: {
        '[class.kbq-expanded]': '!collapsed',
        '[class.kbq-collapsed]': 'collapsed'
    }
})
export class KbqRectangleItem {
    protected readonly isBrowser = inject(Platform).isBrowser;
    protected readonly nativeElement = inject(ElementRef).nativeElement;
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

    getOuterElementWidth(): number {
        if (!this.isBrowser) return 0;

        const { width, marginLeft, marginRight } = this.window.getComputedStyle(this.nativeElement);

        return [width, marginLeft, marginRight].reduce((acc, item) => acc + parseInt(item), 0);
    }
}
