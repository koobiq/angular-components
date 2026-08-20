import { coerceCssPixelValue } from '@angular/cdk/coercion';
import { DOCUMENT } from '@angular/common';
import {
    afterNextRender,
    computed,
    DestroyRef,
    Directive,
    inject,
    input,
    NgZone,
    output,
    Renderer2
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KBQ_WINDOW, kbqInjectNativeElement } from '@koobiq/components/core';
import { fromEvent } from 'rxjs';

/**
 * Directions for resizing.
 *
 * Horizontal direction (x):
 * - Left: -1
 * - None: 0
 * - Right: 1
 *
 * Vertical direction (y):
 * - Up: -1
 * - None: 0
 * - Down: 1
 */
export type KbqResizerDirection = [x: -1 | 0 | 1, y: -1 | 0 | 1];

/**
 * Event emitted when the size of the resizable element changes.
 */
export type KbqResizerSizeChangeEvent = {
    width: number;
    height: number;
};

/**
 * Directive (container) sets whether the element is resizable.
 *
 * @example
 *
 * ```html
 * <div kbqResizable>
 *     <div [kbqResizer]="[-1, 0]"></div>
 * </div>
 * ```
 */
@Directive({
    selector: '[kbqResizable]',
    host: {
        class: 'kbq-resizable'
    },
    exportAs: 'kbqResizable'
})
export class KbqResizable {
    /**
     * @docs-private
     */
    readonly element = kbqInjectNativeElement();
}

/**
 * Directive which defines element resizing direction.
 */
@Directive({
    selector: '[kbqResizer]',
    host: {
        class: 'kbq-resizer',
        '[style.cursor]': 'resolvedCursor()'
    },
    exportAs: 'kbqResizer'
})
export class KbqResizer {
    private readonly element = kbqInjectNativeElement();
    private readonly resizable = inject(KbqResizable);
    private readonly zone = inject(NgZone);
    private readonly document = inject<Document>(DOCUMENT);
    private readonly destroyRef = inject(DestroyRef);
    private readonly renderer = inject(Renderer2);
    private readonly window = inject(KBQ_WINDOW);

    private x = NaN;
    private y = NaN;

    private width = 0;
    private height = 0;

    /**
     * Direction of element resizing.
     */
    readonly direction = input.required<KbqResizerDirection>({ alias: 'kbqResizer' });

    /**
     * Overrides the cursor that is otherwise derived from the resizing direction.
     */
    readonly cursor = input<string | null>(null);

    /**
     * Emits the new size of the element after resizing.
     */
    readonly sizeChange = output<KbqResizerSizeChangeEvent>();

    /**
     * @docs-private
     */
    protected readonly resolvedCursor = computed(() => {
        const cursor = this.cursor();

        if (cursor) return cursor;

        const [x, y] = this.direction();

        if (x === 0 && y === 0) return 'default';
        if (!x) return 'ns-resize';
        if (!y) return 'ew-resize';
        if (x * y > 0) return 'nwse-resize';

        return 'nesw-resize';
    });

    constructor() {
        afterNextRender(() => {
            this.zone.runOutsideAngular(() => {
                fromEvent<PointerEvent>(this.element, 'pointerdown')
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe((event) => this.handleElementPointerDown(event));

                fromEvent<PointerEvent>(this.document, 'pointermove')
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe((event) => this.handleDocumentPointerMove(event));

                fromEvent<PointerEvent>(this.document, 'pointerup')
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe((event) => this.handleDocumentPointerUp(event));
            });
        });
    }

    private handleElementPointerDown(event: PointerEvent): void {
        event.preventDefault();

        this.x = event.x;
        this.y = event.y;

        const { width, height } = this.getResizableSize();

        this.width = width;
        this.height = height;
    }

    /**
     * Reads the resizable element in whichever box model `style.width`/`style.height` will be
     * interpreted in when `updateSize()` writes them back.
     *
     * `clientWidth`/`clientHeight` are the padding box, so feeding them straight into `style.width`
     * made the element jump on the first pointer-down — outward by its padding under the default
     * `content-box`, inward by its border under a consuming application's `border-box` reset. The
     * directive ships no stylesheet of its own, so it inherits whatever the host sets and has to ask
     * rather than assume. Same branch as `KbqFieldSizingContent.calculateWidth()`.
     */
    private getResizableSize(): { width: number; height: number } {
        const style = this.window.getComputedStyle(this.resizable.element);

        if (style.boxSizing === 'border-box') {
            const { width, height } = this.resizable.element.getBoundingClientRect();

            return { width, height };
        }

        return { width: parseFloat(style.width) || 0, height: parseFloat(style.height) || 0 };
    }

    private handleDocumentPointerMove(event: PointerEvent): void {
        if (!event.buttons) return this.handleDocumentPointerUp(event);

        this.updateSize(event);
    }

    private handleDocumentPointerUp(_event: PointerEvent): void {
        this.x = NaN;
    }

    private updateSize({ x, y }: PointerEvent): void {
        if (Number.isNaN(this.x)) return;

        const [directionX, directionY] = this.direction();
        const width = this.width + directionX * (x - this.x);
        const height = this.height + directionY * (y - this.y);

        if (directionX) this.renderer.setStyle(this.resizable.element, 'width', coerceCssPixelValue(width));
        if (directionY) this.renderer.setStyle(this.resizable.element, 'height', coerceCssPixelValue(height));

        this.sizeChange.emit({ width, height });
    }
}
