import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Directive,
    inject,
    Input,
    input,
    NgModule,
    numberAttribute,
    OnDestroy,
    OnInit
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
    private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input() set kbqEllipsisCenter(value: string) {
        this._kbqEllipsisCenter = value;
        this.refresh();
        // check the view to properly calculate text-start and text-end on text initialized
        this.cdr.detectChanges();
    }

    /**
     * Overrides the tooltip's hoverable default, as `KbqOptionTooltip` does. The hint spells out text that
     * the directive had to truncate, so it floats over the neighbouring content — and a pointer-capturing
     * pane would swallow the clicks meant for it.
     */
    readonly ignoreTooltipPointerEvents = input<boolean>(true);

    /**
     * Shortest text worth splitting in the middle. Anything below it keeps its natural order and is cut off
     * at the end by the host's own `text-overflow`.
     */
    readonly minVisibleLength = input<number>(MIN_VISIBLE_LENGTH);

    readonly charWidth = input(7);

    /**
     * Debounce time (ms) for resize events before recalculating ellipsis position.
     * @default 50
     */
    readonly debounceInterval = input<number, unknown>(50, { transform: numberAttribute });

    /** @docs-private */
    readonly resizeStream = new Subject<Event>();

    private _kbqEllipsisCenter: string;

    // Value the consumer assigned through `kbqTooltipDisabled`, kept apart from `truncated` so the two
    // conditions stop overwriting each other in the base class's single `disabled` field.
    private consumerDisabled = false;

    // Whether the text did not fit its host as of the last `refresh()`.
    private truncated = false;

    private resizeSubscription = Subscription.EMPTY;

    /** Hint is suppressed by the consumer, or unnecessary because the whole text is already visible. */
    override get disabled(): boolean {
        return this.consumerDisabled || !this.truncated;
    }

    override set disabled(value: boolean) {
        this.consumerDisabled = coerceBooleanProperty(value);

        this.syncTooltipDisabled();
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.content = this._kbqEllipsisCenter;
        this.refresh();
    }

    ngAfterViewInit(): void {
        this.resizeSubscription = this.resizeStream
            .pipe(debounceTime(this.debounceInterval()))
            .subscribe(() => this.refresh());
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.resizeSubscription.unsubscribe();
    }

    /**
     * Updates the displayed text with center ellipsis truncation based on container width.
     * Recreates start/end span elements, measures available space, and adjusts text accordingly.
     * @docs-private
     */
    refresh(): void {
        let start = '';
        let end = '';

        this.content = this._kbqEllipsisCenter;

        const [dataTextStart, dataTextEnd] = [
            'kbq-ellipsis-center_data-text-start',
            'kbq-ellipsis-center_data-text-end'
        ].map((querySelector) => {
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
            this.truncated = this.elementRef.nativeElement.clientWidth < dataTextStart.scrollWidth;

            if (this.truncated && this._kbqEllipsisCenter.length >= this.minVisibleLength()) {
                const averageCharWidth = this.charWidth();
                const lastCharsLength = Math.round(this.elementRef.nativeElement.clientWidth / 2 / averageCharWidth);
                // Clamped so an underestimated `charWidth` (e.g. wider glyphs than the 7px default assumes)
                // cannot push the whole name into `end`, which has no `text-overflow` and does not shrink.
                const sliceIndex = Math.min(
                    Math.max(1, Math.round(this._kbqEllipsisCenter.length - lastCharsLength)),
                    this._kbqEllipsisCenter.length - 1
                );

                start = this._kbqEllipsisCenter.slice(0, sliceIndex);
                end = this._kbqEllipsisCenter.slice(sliceIndex);
            } else {
                // Text that is not split goes into the start element, the only one carrying
                // `text-overflow: ellipsis` — the end element cannot shrink, so text parked there would
                // overflow the host instead of being cut off.
                start = this._kbqEllipsisCenter;
                end = '';
            }

            dataTextStart.innerText = start;
            dataTextEnd.innerText = end;

            this.syncTooltipDisabled();
            this.cdr.markForCheck();
        });

        this.renderer.appendChild(this.elementRef.nativeElement, dataTextStart);
        this.renderer.appendChild(this.elementRef.nativeElement, dataTextEnd);
    }

    private syncTooltipDisabled(): void {
        // Assigns the protected field rather than going through the base setter, which would fold the
        // derived value back into the bookkeeping that tracks what the consumer actually asked for.
        this._disabled = this.disabled;

        if (this._disabled) {
            this.hide();
        }
    }
}

@NgModule({
    imports: [KbqEllipsisCenterDirective],
    exports: [KbqEllipsisCenterDirective]
})
export class KbqEllipsisCenterModule {}
