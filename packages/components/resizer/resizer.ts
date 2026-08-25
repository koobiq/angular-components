import { coerceCssPixelValue } from '@angular/cdk/coercion';
import { DOCUMENT } from '@angular/common';
import {
    afterNextRender,
    computed,
    DestroyRef,
    Directive,
    effect,
    inject,
    input,
    NgZone,
    output,
    Renderer2,
    RendererStyleFlags2,
    signal
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
    private readonly dragging = signal(false);
    private activePointerId: number | null = null;

    /** Body cursor captured on pointer-down and restored when the drag finishes. `null` while not dragging. */
    private previousBodyCursor: string | null = null;
    // CSS priority is only ever `'important'` or `''`, so a boolean is enough to restore it faithfully.
    private previousBodyCursorImportant = false;

    /**
     * Direction of element resizing.
     */
    readonly direction = input.required<KbqResizerDirection>({ alias: 'kbqResizer' });

    /**
     * Overrides the cursor that is otherwise derived from the resizing direction.
     */
    readonly cursor = input<string | null>(null);

    /**
     * Emits the element size when a pointer drag begins, after the directive has committed to the resize.
     */
    readonly resizeStart = output<KbqResizerSizeChangeEvent>();

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
        effect(() => {
            const cursor = this.resolvedCursor();

            if (this.dragging()) this.updateDocumentCursor(cursor);
        });

        this.destroyRef.onDestroy(() => this.finishDrag());

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

                fromEvent<PointerEvent>(this.document, 'pointercancel')
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe((event) => this.handleDocumentPointerUp(event));

                fromEvent<PointerEvent>(this.element, 'lostpointercapture')
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe((event) => this.handleDocumentPointerUp(event));
            });
        });
    }

    private handleElementPointerDown(event: PointerEvent): void {
        const [directionX, directionY] = this.direction();

        // A handle with no direction is not resizable.
        if (!directionX && !directionY) return;
        // Start only on the primary left button, and never begin a second drag while one is active.
        if (event.button !== 0 || event.isPrimary === false || this.activePointerId !== null) return;

        event.preventDefault();

        this.activePointerId = this.getPointerId(event);
        this.x = event.x;
        this.y = event.y;

        const { width, height } = this.getResizableSize();

        this.width = width;
        this.height = height;

        // Keep the resize cursor when the pointer leaves a handle that has stopped at a size boundary.
        this.element.setPointerCapture?.(this.activePointerId);
        this.dragging.set(true);
        this.applyDocumentCursor(this.resolvedCursor());
        this.resizeStart.emit({ width, height });
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
        // Ignore moves from any pointer other than the one that started this drag.
        if (!this.isActivePointer(event)) return;
        // The button was released without a pointerup reaching us (e.g. outside the window) — end the drag.
        if (!event.buttons) return this.handleDocumentPointerUp(event);

        this.updateSize(event);
    }

    private handleDocumentPointerUp(event: PointerEvent): void {
        // Only the pointer that owns the drag can end it.
        if (!this.isActivePointer(event)) return;

        this.finishDrag();
    }

    private finishDrag(): void {
        const pointerId = this.activePointerId;

        this.activePointerId = null;

        this.x = NaN;
        this.y = NaN;
        this.dragging.set(false);
        this.restoreDocumentCursor();

        if (pointerId !== null && this.element.hasPointerCapture?.(pointerId)) {
            this.element.releasePointerCapture?.(pointerId);
        }
    }

    private getPointerId(event: PointerEvent): number {
        return event.pointerId ?? 1;
    }

    private isActivePointer(event: PointerEvent): boolean {
        return this.activePointerId !== null && this.activePointerId === this.getPointerId(event);
    }

    /**
     * Forces the resize cursor onto `document.body` for the whole drag: when the handle stops at a size
     * boundary the pointer can leave its hit-area, and only a document-level cursor keeps the feedback from
     * flickering to whatever sits underneath. The consumer's own body cursor is saved for {@link restoreDocumentCursor}.
     */
    private applyDocumentCursor(cursor: string): void {
        const { style } = this.document.body;

        this.previousBodyCursor = style.getPropertyValue('cursor');
        this.previousBodyCursorImportant = style.getPropertyPriority('cursor') === 'important';
        this.renderer.setStyle(this.document.body, 'cursor', cursor, RendererStyleFlags2.Important);
    }

    /** Reflects a mid-drag cursor change (e.g. the boundary switch to `e-resize`/`w-resize`) onto the document. */
    private updateDocumentCursor(cursor: string): void {
        this.renderer.setStyle(this.document.body, 'cursor', cursor, RendererStyleFlags2.Important);
    }

    private restoreDocumentCursor(): void {
        if (this.previousBodyCursor === null) return;

        if (this.previousBodyCursor) {
            this.renderer.setStyle(
                this.document.body,
                'cursor',
                this.previousBodyCursor,
                this.previousBodyCursorImportant ? RendererStyleFlags2.Important : undefined
            );
        } else {
            this.renderer.removeStyle(this.document.body, 'cursor');
        }

        this.previousBodyCursor = null;
    }

    private updateSize({ x, y }: PointerEvent): void {
        // Guard against moves that arrive before a drag has captured its origin.
        if (Number.isNaN(this.x)) return;

        const [directionX, directionY] = this.direction();
        const width = this.width + directionX * (x - this.x);
        const height = this.height + directionY * (y - this.y);

        // Write only the axis this handle resizes; the other keeps the element's current size.
        if (directionX) this.renderer.setStyle(this.resizable.element, 'width', coerceCssPixelValue(width));
        if (directionY) this.renderer.setStyle(this.resizable.element, 'height', coerceCssPixelValue(height));

        this.sizeChange.emit({ width, height });
    }
}
