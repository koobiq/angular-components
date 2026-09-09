import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { _CdkPrivateStyleLoader } from '@angular/cdk/private';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    Directive,
    inject,
    Input,
    input,
    NgModule,
    numberAttribute,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

/**
 * Component used to load the `.kbq-ellipsis-center` styles.
 */
@Component({
    selector: 'ellipsis-center-style-loader',
    template: '',
    styleUrl: 'ellipsis-center.scss',
    encapsulation: ViewEncapsulation.None
})
class EllipsisCenterStyleLoader {}

/**
 * Renders text as two spans and moves the ellipsis into the middle, so the tail — a file extension, the
 * digits that tell two reports apart — stays readable when the host is too narrow for the whole string. A
 * tooltip spells out the full text, and is enabled only while something is actually hidden.
 *
 * The tooltip's `forDisabledComponent` has no meaning here: the hint always repeats the text this directive
 * shortened, never an explanation of why a wrapped control is unavailable. Overflow is the only state the
 * directive derives, and `kbqTooltipDisabled` is how a consumer suppresses the hint.
 */
@Directive({
    selector: '[kbqEllipsisCenter]',
    host: {
        class: 'kbq-ellipsis-center'
    }
})
export class KbqEllipsisCenterDirective extends KbqTooltipTrigger implements OnInit, AfterViewInit, OnDestroy {
    private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

    /**
     * Application-wide `ResizeObserver` shared by every consumer, as `KbqTitleDirective` uses. Unlike the
     * `window:resize` listener this directive used to carry, it also reacts to container-only resizes — a
     * splitter drag, a sidebar collapse, or the vertical scrollbar that appears once a file list fills up —
     * none of which resize the window, all of which change where the text has to be split.
     */
    private readonly resizeObserver = inject(SharedResizeObserver);

    /** The two spans this directive renders have no styles of their own until this is loaded. */
    private readonly styleLoader = inject(_CdkPrivateStyleLoader);

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
     *
     * Defaults to `0` — every overflowing text is split — because that is what the directive has always
     * done: the input was declared but never read, so any other default would silently end-truncate labels
     * that consumers expect to see split.
     */
    readonly minVisibleLength = input<number>(0);

    /**
     * Lower bound, in pixels, for the average glyph width used to decide how many characters fit in the
     * tail. The rendered text is measured as well and the wider of the two wins, so an underestimate here
     * can no longer push the extension out of the tail — raising it only shortens the tail further.
     */
    readonly charWidth = input(7);

    /**
     * Debounce time (ms) for resize events before recalculating ellipsis position.
     * @default 50
     */
    readonly debounceInterval = input<number, unknown>(50, { transform: numberAttribute });

    /**
     * @deprecated No longer read. Resizes now come from the shared `ResizeObserver`, which also catches the
     * container-only ones a `window:resize` listener cannot see; the host listener that used to feed this
     * subject is gone, and nothing subscribes to it. Kept as a no-op and removed in the next major version.
     * @docs-private */
    readonly resizeStream = new Subject<Event>();

    private _kbqEllipsisCenter: string;

    // Host width the last completed `refresh()` measured, so a resize that leaves it untouched (the host is
    // clamped to its container) does not schedule work that would produce the same split.
    private lastMeasuredWidth: number | undefined;

    private refreshTimeoutId: ReturnType<typeof setTimeout> | undefined;

    constructor() {
        super();

        this.styleLoader.load(EllipsisCenterStyleLoader);
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.content = this._kbqEllipsisCenter;
        this.refresh();
    }

    ngAfterViewInit(): void {
        super.ngAfterViewInit();

        this.resizeObserver
            .observe(this.elementRef.nativeElement)
            .pipe(debounceTime(this.debounceInterval()), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                if (this.elementRef.nativeElement.clientWidth !== this.lastMeasuredWidth) {
                    this.refresh();
                }
            });
    }

    ngOnDestroy() {
        clearTimeout(this.refreshTimeoutId);

        super.ngOnDestroy();
    }

    /**
     * The hint spells out what the split hid, so `kbqTooltipDisabled="false"` cannot conjure one for a name
     * that fits — unlike the base, where an explicit value wins outright.
     * @docs-private */
    protected override foldDisabled(): boolean {
        return this.explicitlyDisabled === true || (this.derivedDisabled ?? false);
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

        // A queued callback outlives both the spans it measures and the directive itself: it would measure
        // elements a newer `refresh()` has already detached (`scrollWidth === 0`, so the text reads as
        // fitting) and then call `hide()` on a torn-down trigger.
        clearTimeout(this.refreshTimeoutId);

        this.refreshTimeoutId = setTimeout(() => {
            const { clientWidth } = this.elementRef.nativeElement;
            // The full text is still in the start element at this point, so this is the width it needs.
            const textWidth = dataTextStart.scrollWidth;
            const truncated = clientWidth < textWidth;

            this.lastMeasuredWidth = clientWidth;

            if (truncated && this._kbqEllipsisCenter.length >= this.minVisibleLength()) {
                // What the text actually rendered at, not what `charWidth` assumes: with glyphs wider than
                // the Latin-sized default (Cyrillic, CJK, uppercase) the estimate hands the tail more
                // characters than the cell can hold, and the tail does not shrink — so `overflow: hidden`
                // would swallow the extension the split exists to keep.
                const averageCharWidth = Math.max(this.charWidth(), textWidth / this._kbqEllipsisCenter.length);
                const lastCharsLength = Math.round(clientWidth / 2 / averageCharWidth);

                // Both halves have to keep at least one character: an empty start element drops the ellipsis
                // (it is the only one carrying `text-overflow`), an empty end element drops the extension.
                const sliceIndex = Math.max(
                    1,
                    Math.min(
                        Math.round(this._kbqEllipsisCenter.length - lastCharsLength),
                        this._kbqEllipsisCenter.length - 1
                    )
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

            this.setDerivedDisabled(!truncated);
            this.cdr.markForCheck();
        });

        this.renderer.appendChild(this.elementRef.nativeElement, dataTextStart);
        this.renderer.appendChild(this.elementRef.nativeElement, dataTextEnd);
    }
}

@NgModule({
    imports: [KbqEllipsisCenterDirective],
    exports: [KbqEllipsisCenterDirective]
})
export class KbqEllipsisCenterModule {}
