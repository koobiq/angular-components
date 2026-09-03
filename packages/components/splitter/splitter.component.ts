import { coerceCssPixelValue } from '@angular/cdk/coercion';
import { Platform } from '@angular/cdk/platform';
import {
    AfterContentInit,
    AfterViewInit,
    booleanAttribute,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    computed,
    ContentChildren,
    Directive,
    effect,
    forwardRef,
    inject,
    input,
    NgZone,
    numberAttribute,
    OnDestroy,
    output,
    OutputRefSubscription,
    QueryList,
    Renderer2,
    Signal,
    signal,
    viewChild,
    viewChildren,
    ViewEncapsulation
} from '@angular/core';
import { KBQ_WINDOW, kbqInjectNativeElement } from '@koobiq/components/core';
import { Subscription } from 'rxjs';

interface IArea {
    area: KbqSplitterAreaDirective;
    index: number;
    order: number;
    initialSize: number;
}

interface IPoint {
    x: number;
    y: number;
}

const enum StyleProperty {
    Flex = 'flex',
    FlexBasis = 'flex-basis',
    FlexDirection = 'flex-direction',
    Height = 'height',
    MaxWidth = 'max-width',
    MinHeight = 'min-height',
    MinWidth = 'minWidth',
    OffsetHeight = 'offsetHeight',
    OffsetWidth = 'offsetWidth',
    Order = 'order',
    Width = 'width',
    Top = 'top',
    Left = 'left',
    Cursor = 'cursor'
}

/** Width or height of a gutter, in pixels. */
const DEFAULT_GUTTER_SIZE = 6;

/** Coerces a gutter size, falling back to the default for anything that is not a positive number. */
const gutterSizeAttribute = (value: unknown): number => {
    const size = numberAttribute(value, DEFAULT_GUTTER_SIZE);

    return size > 0 ? size : DEFAULT_GUTTER_SIZE;
};

/** Axis the splitter lays its areas out along. */
export enum Direction {
    Horizontal = 'horizontal',
    Vertical = 'vertical'
}

/**
 * Draggable divider rendered by the splitter between two areas.
 *
 * @docs-private
 */
@Directive({
    selector: 'kbq-gutter',
    host: {
        class: 'kbq-gutter',
        '[class.kbq-gutter_vertical]': 'isVertical()',
        '[class.kbq-gutter_dragged]': 'dragged()',
        '(mousedown)': 'dragged.set(true)'
    }
})
export class KbqGutterDirective {
    private readonly nativeElement = kbqInjectNativeElement();
    private readonly renderer = inject(Renderer2);

    /** Axis the gutter divides. */
    readonly direction = input<Direction>(Direction.Vertical);

    /** Flex order of the gutter among the areas. */
    readonly order = input(0, { transform: numberAttribute });

    /** Thickness of the gutter, in pixels. */
    readonly size = input(DEFAULT_GUTTER_SIZE, { transform: gutterSizeAttribute });

    /** Whether the gutter divides a vertical stack. */
    readonly isVertical = computed(() => this.direction() === Direction.Vertical);

    /** Whether the gutter is currently held down. */
    readonly dragged = signal(false);

    constructor() {
        // The gutters are rendered inside an `@for` and keep their instance across reorders, so the layout
        // has to follow the inputs rather than run once on init.
        effect(() => {
            const size = this.size();
            const isVertical = this.isVertical();

            this.setStyle(StyleProperty.FlexBasis, coerceCssPixelValue(size));
            this.setStyle(StyleProperty.Order, this.order());

            // fix IE issue with gutter icon. flex-direction is required for flex alignment options
            this.setStyle(StyleProperty.FlexDirection, isVertical ? 'row' : 'column');

            // Clear the dimension the other direction owns: the layout runs again when `direction` changes,
            // and a leftover width would keep a vertical gutter as wide as it was while horizontal.
            if (isVertical) {
                this.renderer.removeStyle(this.nativeElement, StyleProperty.Width);
                this.setStyle(StyleProperty.Height, coerceCssPixelValue(size));
            } else {
                this.setStyle(StyleProperty.Width, coerceCssPixelValue(size));
                this.setStyle(StyleProperty.Height, '100%');
            }
        });
    }

    /** Offset of the gutter within the splitter. */
    getPosition(): IPoint {
        return {
            x: this.nativeElement.offsetLeft,
            y: this.nativeElement.offsetTop
        };
    }

    private setStyle(property: StyleProperty, value: string | number): void {
        this.renderer.setStyle(this.nativeElement, property, value);
    }
}

/**
 * Placeholder the splitter drags in place of the gutter while `useGhost` is on. It is rendered by the
 * splitter with no bindings and driven entirely from `KbqSplitterComponent`.
 *
 * @docs-private
 */
@Directive({
    selector: 'kbq-gutter-ghost',
    host: {
        class: 'kbq-gutter-ghost',
        '[class.kbq-gutter-ghost_vertical]': 'isVertical',
        '[class.kbq-gutter-ghost_visible]': 'visible'
    }
})
export class KbqGutterGhostDirective {
    private readonly nativeElement = kbqInjectNativeElement();
    private readonly renderer = inject(Renderer2);

    visible: boolean = false;

    get x(): number {
        return this._x;
    }

    set x(x: number) {
        this._x = x;
        this.setStyle(StyleProperty.Left, coerceCssPixelValue(x));
    }

    private _x: number = 0;

    get y(): number {
        return this._y;
    }

    set y(y: number) {
        this._y = y;
        this.setStyle(StyleProperty.Top, coerceCssPixelValue(y));
    }

    private _y: number = 0;

    get direction(): Direction {
        return this._direction;
    }

    set direction(direction: Direction) {
        this._direction = direction;
        this.updateDimensions();
    }

    private _direction: Direction = Direction.Vertical;

    get size(): number {
        return this._size;
    }

    set size(size: number) {
        this._size = gutterSizeAttribute(size);
        this.updateDimensions();
    }

    private _size: number = DEFAULT_GUTTER_SIZE;

    get isVertical(): boolean {
        return this.direction === Direction.Vertical;
    }

    private updateDimensions(): void {
        this.setStyle(this.isVertical ? StyleProperty.Width : StyleProperty.Height, '100%');
        this.setStyle(this.isVertical ? StyleProperty.Height : StyleProperty.Width, coerceCssPixelValue(this.size));
    }

    private setStyle(property: StyleProperty, value: string | number): void {
        this.renderer.setStyle(this.nativeElement, property, value);
    }
}

/** Component that lays out resizable areas separated by draggable gutters. */
@Component({
    selector: 'kbq-splitter',
    imports: [KbqGutterDirective, KbqGutterGhostDirective],
    templateUrl: './splitter.component.html',
    styleUrls: ['splitter.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-splitter'
    },
    exportAs: 'kbqSplitter',
    preserveWhitespaces: false
})
export class KbqSplitterComponent implements AfterContentInit, OnDestroy {
    private readonly nativeElement = kbqInjectNativeElement();
    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly ngZone = inject(NgZone);
    private readonly renderer = inject(Renderer2);

    private readonly gutters = viewChildren(KbqGutterDirective);
    private readonly ghost = viewChild.required(KbqGutterGhostDirective);

    @ContentChildren(forwardRef(() => KbqSplitterAreaDirective))
    private areaRefs: QueryList<KbqSplitterAreaDirective>;

    private readonly dragging = signal(false);

    private readonly areaPositionDivider: number = 2;
    private readonly listeners: (() => void)[] = [];

    private areasChangeSubscription: Subscription = Subscription.EMPTY;

    /** Emitted once a gutter drag has finished. */
    readonly gutterPositionChange = output<void>();

    /** Whether the gutters are hidden. The areas stay resizable. */
    readonly hideGutters = input(false, { transform: booleanAttribute });

    /** Axis the areas are laid out along. */
    readonly direction = input<Direction>(Direction.Horizontal);

    /** Whether dragging is disabled. */
    readonly disabled = input(false, { transform: booleanAttribute });

    /** Whether a drag moves a ghost divider and applies the new sizes on release. */
    readonly useGhost = input(false, { transform: booleanAttribute });

    /** Thickness of a gutter, in pixels. Anything that is not a positive number falls back to the default. */
    readonly gutterSize = input(DEFAULT_GUTTER_SIZE, { transform: gutterSizeAttribute });

    /** Whether a gutter is currently being dragged. */
    readonly isDragging: Signal<boolean> = this.dragging.asReadonly();

    /** Whether the areas are stacked vertically. */
    readonly isVertical = computed(() => this.direction() === Direction.Vertical);

    /** @docs-private */
    protected areas: IArea[] = [];

    constructor() {
        effect(() => this.setStyle(StyleProperty.FlexDirection, this.isVertical() ? 'column' : 'row'));
    }

    /** @docs-private */
    addArea(area: KbqSplitterAreaDirective): void {
        this.areas.push(this.mapAndOrderArea(area, this.areas.length));
        this.changeDetectorRef.detectChanges();
    }

    ngAfterContentInit(): void {
        this.areasChangeSubscription = this.areaRefs.changes.subscribe((data: QueryList<KbqSplitterAreaDirective>) => {
            this.areas = data.map(this.mapAndOrderArea);
            this.changeDetectorRef.markForCheck();
        });
    }

    ngOnDestroy(): void {
        this.areasChangeSubscription.unsubscribe();
    }

    /** @docs-private */
    protected onMouseDown(event: MouseEvent, leftAreaIndex: number, rightAreaIndex: number): void {
        if (this.disabled()) {
            return;
        }

        event.preventDefault();

        const startPoint: IPoint = {
            x: event.screenX,
            y: event.screenY
        };

        const leftArea = this.areas[leftAreaIndex];
        const rightArea = this.areas[rightAreaIndex];

        leftArea.initialSize = leftArea.area.getSize();
        rightArea.initialSize = rightArea.area.getSize();

        let currentGutter: KbqGutterDirective | undefined;

        if (this.useGhost()) {
            const gutterOrder = leftAreaIndex * 2 + 1;

            currentGutter = this.gutters().find((gutter: KbqGutterDirective) => gutter.order() === gutterOrder);

            if (currentGutter) {
                const gutterPosition = currentGutter.getPosition();
                const ghost = this.ghost();

                ghost.direction = currentGutter.direction();
                ghost.size = currentGutter.size();
                ghost.x = gutterPosition.x;
                ghost.y = gutterPosition.y;

                ghost.visible = true;
                this.setStyle(
                    StyleProperty.Cursor,
                    currentGutter.direction() === Direction.Vertical ? 'row-resize' : 'col-resize'
                );
            }
        } else {
            this.areas.forEach((item) => {
                const size = item.area.getSize();

                item.area.disableFlex();
                item.area.setSize(size);
            });
        }

        this.listeners.push(
            this.renderer.listen('document', 'mouseup', () => this.onMouseUp(leftArea, rightArea, currentGutter))
        );

        this.ngZone.runOutsideAngular(() => {
            this.listeners.push(
                this.renderer.listen('document', 'mousemove', (e: MouseEvent) =>
                    this.onMouseMove(e, startPoint, leftArea, rightArea, currentGutter)
                )
            );
        });

        this.dragging.set(true);
    }

    /** @docs-private */
    removeArea(area: KbqSplitterAreaDirective): void {
        let indexToRemove: number = -1;

        this.areas.some((item, index) => {
            if (item.area === area) {
                indexToRemove = index;

                return true;
            }

            return false;
        });

        if (indexToRemove === -1) {
            return;
        }

        this.areas.splice(indexToRemove, 1);
    }

    private mapAndOrderArea = (area: KbqSplitterAreaDirective, index: number): IArea => {
        const order = index * this.areaPositionDivider;

        area.setOrder(order);

        return {
            area,
            index,
            order,
            initialSize: area.getSize()
        };
    };

    private updateGutter(): void {
        this.gutters().forEach((gutter) => gutter.dragged.set(false));
    }

    private onMouseMove(
        event: MouseEvent,
        startPoint: IPoint,
        leftArea: IArea,
        rightArea: IArea,
        currentGutter: KbqGutterDirective | undefined
    ): void {
        if (!this.isDragging() || this.disabled()) {
            return;
        }

        const endPoint: IPoint = {
            x: event.screenX,
            y: event.screenY
        };

        const offset = this.isVertical() ? startPoint.y - endPoint.y : startPoint.x - endPoint.x;

        if (this.useGhost() && currentGutter) {
            const gutterPosition = currentGutter.getPosition();
            const leftPos = leftArea.area.getPosition();
            const rightPos = rightArea.area.getPosition();
            const rightMin = rightArea.area.getMinSize() || 0;
            const leftMin = leftArea.area.getMinSize() || 0;

            const key = this.isVertical() ? 'y' : 'x';

            const minPos = leftPos[key] - leftMin;
            const maxPos = rightPos[key] + (rightArea.area.getSize() || 0) - rightMin - currentGutter.size();
            const newPos = gutterPosition[key] - offset;

            this.ghost()[key] = newPos < minPos ? minPos : Math.min(newPos, maxPos);
        } else {
            this.resizeAreas(leftArea, rightArea, offset);
        }
    }

    private resizeAreas(leftArea: IArea, rightArea: IArea, sizeOffset: number): void {
        const newLeftAreaSize = leftArea.initialSize - sizeOffset;
        const newRightAreaSize = rightArea.initialSize + sizeOffset;

        const minLeftAreaSize = leftArea.area.getMinSize();
        const minRightAreaSize = rightArea.area.getMinSize();

        if (newLeftAreaSize < minLeftAreaSize || newRightAreaSize < minRightAreaSize) {
            return;
        } else if (newLeftAreaSize <= 0) {
            leftArea.area.setSize(0);
            rightArea.area.setSize(rightArea.initialSize + leftArea.initialSize);
        } else if (newRightAreaSize <= 0) {
            leftArea.area.setSize(rightArea.initialSize + leftArea.initialSize);
            rightArea.area.setSize(0);
        } else {
            leftArea.area.setSize(newLeftAreaSize);
            rightArea.area.setSize(newRightAreaSize);
        }
    }

    private onMouseUp(leftArea: IArea, rightArea: IArea, currentGutter: KbqGutterDirective | undefined): void {
        while (this.listeners.length > 0) {
            const unsubscribe = this.listeners.pop();

            if (unsubscribe) {
                unsubscribe();
            }
        }

        if (this.useGhost() && currentGutter) {
            const gutterPosition = currentGutter.getPosition();
            const ghost = this.ghost();
            const offset =
                ghost.direction === Direction.Vertical ? gutterPosition.y - ghost.y : gutterPosition.x - ghost.x;

            this.resizeAreas(leftArea, rightArea, offset);
            ghost.visible = false;
            this.setStyle(StyleProperty.Cursor, 'unset');
        }

        this.dragging.set(false);

        this.updateGutter();

        // TODO: The 'emit' function requires a mandatory void argument
        this.gutterPositionChange.emit();

        this.changeDetectorRef.markForCheck();
    }

    private setStyle(property: StyleProperty, value: string | number): void {
        this.renderer.setStyle(this.nativeElement, property, value);
    }
}

/** Directive that marks a resizable area of a splitter. */
@Directive({
    selector: '[kbq-splitter-area]',
    host: {
        class: 'kbq-splitter-area',
        '[class.kbq-splitter-area_resizing]': 'isResizing()'
    }
})
export class KbqSplitterAreaDirective implements AfterViewInit, OnDestroy {
    private readonly nativeElement = kbqInjectNativeElement();
    private readonly renderer = inject(Renderer2);
    private readonly splitter = inject(KbqSplitterComponent);
    private readonly window = inject(KBQ_WINDOW);
    private readonly platform = inject(Platform);

    private gutterPositionSubscription: OutputRefSubscription | null = null;

    /** Emitted with the new size once a drag that changed this area has finished. */
    readonly sizeChange = output<number>();

    /** @docs-private */
    protected readonly isResizing = computed(() => this.splitter.isDragging());

    /** @docs-private */
    disableFlex(): void {
        this.renderer.removeStyle(this.nativeElement, StyleProperty.Flex);
    }

    ngAfterViewInit(): void {
        this.splitter.addArea(this);

        this.removeStyle(StyleProperty.MaxWidth);

        if (this.splitter.isVertical()) {
            this.setStyle(StyleProperty.Width, '100%');
            this.removeStyle(StyleProperty.Height);
        } else {
            this.setStyle(StyleProperty.Height, '100%');
            this.removeStyle(StyleProperty.Width);
        }

        this.gutterPositionSubscription = this.splitter.gutterPositionChange.subscribe(this.emitSizeChange);
    }

    ngOnDestroy(): void {
        this.gutterPositionSubscription?.unsubscribe();
        this.splitter.removeArea(this);
    }

    /** @docs-private */
    setOrder(order: number): void {
        this.setStyle(StyleProperty.Order, order);
    }

    /** @docs-private */
    setSize(size: number): void {
        if (isNaN(size)) {
            return;
        }

        this.setStyle(this.getSizeProperty(), coerceCssPixelValue(numberAttribute(size, 0)));
    }

    /** @docs-private */
    getSize(): number {
        if (!this.platform.isBrowser) return 0;

        return this.nativeElement[this.getOffsetSizeProperty()];
    }

    /** @docs-private */
    getPosition(): IPoint {
        return {
            x: this.nativeElement.offsetLeft,
            y: this.nativeElement.offsetTop
        };
    }

    /** @docs-private */
    getMinSize(): number {
        const styles = this.window.getComputedStyle(this.nativeElement);

        return parseFloat(styles[this.getMinSizeProperty()]);
    }

    private getMinSizeProperty(): StyleProperty {
        return this.splitter.isVertical() ? StyleProperty.MinHeight : StyleProperty.MinWidth;
    }

    private getOffsetSizeProperty(): StyleProperty {
        return this.splitter.isVertical() ? StyleProperty.OffsetHeight : StyleProperty.OffsetWidth;
    }

    private getSizeProperty(): StyleProperty {
        return this.splitter.isVertical() ? StyleProperty.Height : StyleProperty.Width;
    }

    private setStyle(style: StyleProperty, value: string | number): void {
        this.renderer.setStyle(this.nativeElement, style, value);
    }

    private removeStyle(style: StyleProperty): void {
        this.renderer.removeStyle(this.nativeElement, style);
    }

    private emitSizeChange = () => {
        this.sizeChange.emit(this.getSize());
    };
}
