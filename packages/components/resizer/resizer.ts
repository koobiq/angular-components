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
import { kbqInjectNativeElement } from '@koobiq/components/core';
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
    standalone: true,
    selector: '[kbqResizable]',
    exportAs: 'kbqResizable',
    host: {
        class: 'kbq-resizable'
    }
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
    standalone: true,
    selector: '[kbqResizer]',
    exportAs: 'kbqResizer',
    host: {
        class: 'kbq-resizer',
        '[style.cursor]': 'cursor()'
    }
})
export class KbqResizer {
    private readonly element = kbqInjectNativeElement();
    private readonly resizable = inject(KbqResizable);
    private readonly zone = inject(NgZone);
    private readonly document = inject<Document>(DOCUMENT);
    private readonly destroyRef = inject(DestroyRef);
    private readonly renderer = inject(Renderer2);

    private x = NaN;
    private y = NaN;

    private width = 0;
    private height = 0;

    /**
     * Direction of element resizing.
     */
    readonly direction = input.required<KbqResizerDirection>({ alias: 'kbqResizer' });

    /**
     * Emits the new size of the element after resizing.
     */
    readonly sizeChange = output<KbqResizerSizeChangeEvent>();

    /**
     * @docs-private
     */
    protected readonly cursor = computed(() => {
        const [x, y] = this.direction();

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

        const { clientWidth, clientHeight } = this.resizable.element;

        this.width = clientWidth;
        this.height = clientHeight;
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
