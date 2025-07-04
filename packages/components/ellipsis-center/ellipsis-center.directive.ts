import {
    AfterViewInit,
    ChangeDetectorRef,
    Directive,
    inject,
    Input,
    NgModule,
    numberAttribute,
    OnDestroy,
    OnInit,
    Renderer2
} from '@angular/core';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

const MIN_VISIBLE_LENGTH = 50;

@Directive({
    selector: '[kbqEllipsisCenter]',
    host: {
        class: 'kbq-ellipsis-center',
        '(window:resize)': 'resizeStream.next($event)'
    }
})
export class KbqEllipsisCenterDirective extends KbqTooltipTrigger implements OnInit, AfterViewInit, OnDestroy {
    private renderer: Renderer2 = inject(Renderer2);
    private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

    @Input() set kbqEllipsisCenter(value: string) {
        this._kbqEllipsisCenter = value;
        this.refresh();
        // check the view to properly calculate text-start and text-end on text initialized
        this.cdr.detectChanges();
    }

    @Input() minVisibleLength: number = MIN_VISIBLE_LENGTH;

    @Input() charWidth = 7;

    /**
     * Debounce time (ms) for resize events before recalculating ellipsis position.
     * @default 50
     */
    @Input({ transform: numberAttribute }) debounceInterval: number = 50;

    /** @docs-private */
    readonly resizeStream = new Subject<Event>();

    private _kbqEllipsisCenter: string;

    private resizeSubscription = Subscription.EMPTY;

    override ngOnInit(): void {
        super.ngOnInit();
        this.content = this._kbqEllipsisCenter;
        this.refresh();
    }

    ngAfterViewInit(): void {
        this.resizeSubscription = this.resizeStream
            .pipe(debounceTime(this.debounceInterval))
            .subscribe(() => this.refresh());
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.resizeSubscription.unsubscribe();
    }

    /**
     * Updates the displayed text with center ellipsis truncation based on container width.
     * Recreates start/end span elements, measures available space, and adjusts text accordingly.
     */
    refresh(): void {
        let start = '';
        let end = '';

        this.content = this._kbqEllipsisCenter;

        const [dataTextStart, dataTextEnd] = ['data-text-start', 'data-text-end'].map((querySelector) => {
            const element = this.elementRef.nativeElement.querySelector(`.${querySelector}`);

            if (element) {
                this.renderer.removeChild(this.elementRef.nativeElement, element);
            }

            const newElement = this.renderer.createElement('span');

            this.renderer.addClass(newElement, querySelector);

            return newElement;
        });

        this.renderer.appendChild(dataTextStart, this.renderer.createText(this._kbqEllipsisCenter));
        this.renderer.appendChild(dataTextEnd, this.renderer.createText(end));
        setTimeout(() => {
            this.disabled = this.elementRef.nativeElement.clientWidth > dataTextStart.scrollWidth;

            if (this.disabled) {
                start = '';
                end = this._kbqEllipsisCenter;
            } else {
                const averageCharWidth = this.charWidth;
                const lastCharsLength = Math.round(this.elementRef.nativeElement.clientWidth / 2 / averageCharWidth);
                const sliceIndex: number = Math.round(this._kbqEllipsisCenter.length - lastCharsLength);

                start = this._kbqEllipsisCenter.slice(0, sliceIndex);
                end = this._kbqEllipsisCenter.slice(sliceIndex);
            }

            dataTextStart.innerText = start;
            dataTextEnd.innerText = end;

            this.cdr.markForCheck();
        });

        this.renderer.appendChild(this.elementRef.nativeElement, dataTextStart);
        this.renderer.appendChild(this.elementRef.nativeElement, dataTextEnd);
    }
}

@NgModule({
    exports: [KbqEllipsisCenterDirective],
    declarations: [KbqEllipsisCenterDirective]
})
export class KbqEllipsisCenterModule {}
