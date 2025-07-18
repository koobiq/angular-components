import { DOCUMENT } from '@angular/common';
import { afterNextRender, DestroyRef, Directive, ElementRef, inject, Input, NgModule, NgZone } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';

@Directive({
    standalone: true,
    selector: '[kbqResizable]',
    exportAs: 'kbqResizable',
    host: {
        class: 'kbq-resizable'
    }
})
export class KbqResizable {
    readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
}

@Directive({
    standalone: true,
    selector: '[kbqResizer]',
    exportAs: 'kbqResizer',
    host: {
        class: 'kbq-resizer',
        '[style.cursor]': 'cursor'
    }
})
export class KbqResizer {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly resizable: ElementRef<HTMLElement> = inject(KbqResizable).elementRef;
    private readonly zone = inject(NgZone);
    private readonly document = inject<Document>(DOCUMENT);
    private readonly destroyRef = inject(DestroyRef);

    private x = NaN;
    private y = NaN;
    private width = 0;
    private height = 0;

    /**
     * Направление изменения размера элемента.
     *
     * Массив из двух чисел [x, y], где:
     * - x: направление по горизонтали (-1 влево, 0 без изменения, 1 вправо)
     * - y: направление по вертикали (-1 вверх, 0 без изменения, 1 вниз)
     */
    @Input()
    public kbqResizer: readonly [x: number, y: number] = [0, 0];

    // @Output()
    // public readonly kbqSizeChange = new EventEmitter<readonly [x: number, y: number]>();

    protected get cursor(): string {
        if (!this.kbqResizer[0]) {
            return 'ns-resize';
        }

        if (!this.kbqResizer[1]) {
            return 'ew-resize';
        }

        if (this.kbqResizer[0] * this.kbqResizer[1] > 0) {
            return 'nwse-resize';
        }

        return 'nesw-resize';
    }

    constructor() {
        afterNextRender(() => {
            this.zone.runOutsideAngular(() => {
                fromEvent<PointerEvent>(this.elementRef.nativeElement, 'pointerdown')
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
        this.width = this.resizable.nativeElement.clientWidth;
        this.height = this.resizable.nativeElement.clientHeight;
    }

    private handleDocumentPointerMove(event: PointerEvent): void {
        if (!event.buttons) {
            this.handleDocumentPointerUp();
        } else {
            this.onMove(event);
        }
    }

    private handleDocumentPointerUp(_event?: PointerEvent): void {
        this.x = NaN;
    }

    private onMove({ x, y }: PointerEvent): void {
        if (Number.isNaN(this.x)) {
            return;
        }

        const { style } = this.resizable.nativeElement;
        const size = [
            this.width + this.kbqResizer[0] * (x - this.x),
            this.height + this.kbqResizer[1] * (y - this.y)
        ] as const;

        if (this.kbqResizer[0]) {
            style.width = `${size[0]}px`;
        }

        if (this.kbqResizer[1]) {
            style.height = `${size[1]}px`;
        }

        // console.log('size', size);
        // this.kbqSizeChange.emit(size);
    }
}

const COMPONENTS = [KbqResizable, KbqResizer];

@NgModule({
    imports: COMPONENTS,
    exports: COMPONENTS
})
export class KbqResizeModule {}
