import { Directionality } from '@angular/cdk/bidi';
import { Platform } from '@angular/cdk/platform';
import {
    afterNextRender,
    afterRenderEffect,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    effect,
    ElementRef,
    forwardRef,
    inject,
    input,
    Renderer2,
    signal,
    untracked,
    viewChild,
    viewChildren,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgControl } from '@angular/forms';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { KbqFormFieldControl } from '@koobiq/components/form-field';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import type { KbqSliderFill, KbqSliderScale, KbqSliderValue } from './slider.types';
import { KbqSliderBase } from './slider-base';
import { sliderEqual, sliderSnap, sliderStops } from './slider-value';

/** Selects a number or range by dragging, clicking the scale or using the keyboard. */
@Component({
    selector: 'kbq-slider',
    imports: [KbqTooltipTrigger],
    templateUrl: './slider.html',
    styleUrls: ['./slider.scss', './slider-tokens.scss'],
    providers: [{ provide: KbqFormFieldControl, useExisting: forwardRef(() => KbqSlider) }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-slider',
        '[attr.id]': 'id()',
        '[class.kbq-disabled]': 'disabled()',
        '[class.kbq-readonly]': 'readonly()',
        '[class.kbq-invalid]': 'errorState()',
        '[class.kbq-slider_snap]': 'animateMark()',
        '[class.kbq-slider_dragging]': 'dragging()',
        '[class.kbq-slider_vertical]': 'vertical()',
        '[class.kbq-slider_center]': "thumbAlignment() === 'center'",
        '[class.kbq-slider_with-labels]': 'hasMarkLabels()',
        '(focusin)': 'focused.set(true)',
        '(focusout)': 'onFocusOut($event)'
    },
    exportAs: 'kbqSlider'
})
export class KbqSlider extends KbqSliderBase {
    /** Vertical layout, increasing from bottom to top. Defaults to `false`. */
    readonly vertical = input<boolean, boolean | string | null | undefined>(false, { transform: booleanAttribute });
    /** Reverses the scale direction. Defaults to `false`. */
    readonly reversed = input<boolean, boolean | string | null | undefined>(false, { transform: booleanAttribute });
    /** Keeps thumbs within the control, or centres them on its endpoints. Defaults to `'contain'`. */
    readonly thumbAlignment = input<'contain' | 'center'>('contain');
    /** Highlighted portion of the scale. Ranges fill between their bounds unless set to `'outside'`. Defaults to `'start'`. */
    readonly fill = input<KbqSliderFill>('start');
    /** Origin of the `'origin'` fill, in value units. Defaults to `0`. */
    readonly fillOrigin = input(0);
    /** Optional mapping for a non-linear scale. Defaults to a linear scale. */
    readonly scale = input<KbqSliderScale>();
    /** Shows the value on focus, hover and drag. Defaults to `false`. */
    readonly showTooltip = input<boolean, boolean | string | null | undefined>(false, { transform: booleanAttribute });
    /** Also shows the value when a read-only thumb receives focus. Defaults to `false`. */
    readonly tooltipOnFocus = input<boolean, boolean | string | null | undefined>(false, {
        transform: booleanAttribute
    });
    /** Number of steps advanced by Page Up/Down. Defaults to `10`. */
    readonly pageStep = input(10);
    /** @docs-private */
    readonly controlType = 'slider';

    private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly platform = inject(Platform);
    private readonly directionality = inject(Directionality, { optional: true });
    private readonly ancestorControl = inject(NgControl, { optional: true, skipSelf: true });
    private readonly direction = signal(this.directionality?.value ?? 'ltr');
    private readonly renderer = inject(Renderer2);
    private readonly window = inject(KBQ_WINDOW);
    private readonly rail = viewChild<ElementRef<HTMLElement>>('rail');
    private readonly surface = viewChild<ElementRef<HTMLElement>>('surface');
    protected readonly animateMark = signal(false);
    protected readonly activeIndex = signal(0);
    protected readonly tooltipIndex = signal<number | null>(null);
    protected readonly visibleMarks = computed(() =>
        this.marks().filter(
            (mark) => Number.isFinite(mark.value) && mark.value >= this.bounds().min && mark.value <= this.bounds().max
        )
    );
    protected readonly hasMarkLabels = computed(() => this.visibleMarks().some((mark) => !!mark.label));
    protected readonly segments = computed(() => {
        const values = this.values();
        const { min, max } = this.bounds();
        const fill = this.fill();
        let segments: [number, number][];

        if (fill === 'none') return [];
        if (values.length === 2)
            segments =
                fill === 'outside'
                    ? [
                          [min, values[0]],
                          [values[1], max]
                      ]
                    : [[values[0], values[1]]];
        else if (fill === 'end' || fill === 'outside') segments = [[values[0], max]];
        else if (fill === 'origin') segments = [[this.fillOrigin(), values[0]]];
        else segments = [[min, values[0]]];

        return segments.map(([a, b]) => {
            const first = this.position(a);
            const second = this.position(b);
            const end = Math.max(first, second);

            const start = Math.min(first, second);
            const size = end - start;
            const inset = 'var(--kbq-slider-inset)';

            return {
                start: `calc(${start}% - ${start === 0 && size > 0 ? inset : '0px'})`,
                size: `calc(${size}% + ${size > 0 && end < 100 ? 'var(--kbq-slider-fill-extension, 0px)' : '0px'} + ${size > 0 && start === 0 ? inset : '0px'} + ${size > 0 && end === 100 ? inset : '0px'})`
            };
        });
    });
    private pointer: { id: number; start: KbqSliderValue; offset: number; overlapped: boolean } | null = null;
    private keyboardStart: KbqSliderValue | null = null;
    private readonly tooltips = viewChildren(KbqTooltipTrigger);
    protected readonly dragging = signal(false);

    private tooltipTimer: ReturnType<typeof setTimeout> | undefined;

    constructor() {
        super();
        this.directionality?.change.pipe(takeUntilDestroyed()).subscribe((direction) => this.direction.set(direction));
        effect(() => {
            this.disabled();
            this.readonly();

            // A changed configuration ends the old gesture before its geometry or value shape can drift.
            this.settings();
            this.collision();
            this.vertical();
            this.reversed();
            this.scale();
            this.direction();
            untracked(() => this.cancelGesture());
        });
        afterRenderEffect(() => {
            const index = this.tooltipIndex();

            this.values();
            if (index !== null) this.tooltips()[index]?.overlayRef?.updatePosition();
        });
        const destroyRef = inject(DestroyRef);

        afterNextRender(() => {
            const stopBlur = this.renderer.listen(this.window, 'blur', () => this.cancelGesture());

            destroyRef.onDestroy(stopBlur);
            const form = this.element.nativeElement.closest('form');
            const initial = this.value();

            if (form && !this.ngControl && !this.ancestorControl) {
                const stopReset = this.renderer.listen(form, 'reset', (event: Event) => {
                    queueMicrotask(() => {
                        if (!event.defaultPrevented && !destroyRef.destroyed) {
                            this.cancelGesture();
                            this.writeValue(initial);
                        }
                    });
                });

                destroyRef.onDestroy(stopReset);
            }
        });
        destroyRef.onDestroy(() => {
            this.clearTooltip();
            this.pointer = null;
        });
    }

    /** Focuses a thumb by its stable lower/upper index. Defaults to the first thumb. */
    override focus(options?: FocusOptions, index = 0): void {
        this.element.nativeElement.querySelectorAll<HTMLInputElement>('.kbq-slider__input')[index]?.focus(options);
    }

    /** @docs-private */
    onContainerClick(event: MouseEvent): void {
        if (!this.element.nativeElement.contains(event.target as Node)) this.focus();
    }

    protected position(value: number): number {
        const { min, max } = this.bounds();
        const fraction = this.scale()?.toPosition(value) ?? (max === min ? 0 : (value - min) / (max - min));
        const position = Math.max(0, Math.min(1, fraction));

        return (this.isFlipped() ? 1 - position : position) * 100;
    }

    private isFlipped(): boolean {
        return (this.vertical() || this.direction() === 'rtl') !== this.reversed();
    }

    protected onPointerDown(event: PointerEvent): void {
        if (!this.platform.isBrowser || this.disabled() || this.pointer || event.button !== 0 || !event.isPrimary)
            return;

        this.animateMark.set(false);
        const target = event.target as HTMLElement;
        const thumb = target.closest<HTMLElement>('[data-thumb-index]');
        const next = this.valueAt(event);
        const index = thumb ? Number(thumb.dataset['thumbIndex']) : this.nearest(next);

        event.preventDefault();
        this.activeIndex.set(index);
        this.focus({ preventScroll: true }, index);
        if (this.readonly()) return;
        this.finishKeyboard();
        this.pointer = {
            id: event.pointerId,
            start: this.value(),
            overlapped: !!thumb && this.values().length === 2 && this.thumbValue(0) === this.thumbValue(1),
            offset: thumb ? this.position(this.thumbValue(index)) - this.pointerPosition(event) : 0
        };
        this.dragging.set(true);
        this.revealTooltip(index);
        this.surface()?.nativeElement.setPointerCapture(event.pointerId);
        if (!thumb) this.updateFromPointer(next);
    }

    protected onPointerMove(event: PointerEvent): void {
        if (this.pointer?.id !== event.pointerId) return;
        const next = this.valueAt(event, this.pointer.offset);

        if (this.pointer.overlapped && sliderSnap(next, this.settings()) !== this.thumbValue(0)) {
            this.activeIndex.set(next < this.thumbValue(0) ? 0 : 1);
            this.focus({ preventScroll: true }, this.activeIndex());
            this.pointer.overlapped = false;
        }

        this.updateFromPointer(next);
    }

    protected onPointerUp(event: PointerEvent): void {
        if (this.pointer?.id !== event.pointerId) return;
        const start = this.pointer.start;

        this.releasePointer();
        this.clearTooltip();
        this.onTouched();
        if (!sliderEqual(start, this.value())) this.valueCommit.emit({ value: this.value(), source: 'pointer' });
    }

    protected onPointerCancel(event: PointerEvent): void {
        if (this.pointer?.id === event.pointerId) this.cancelGesture();
    }

    protected onKeyDown(event: KeyboardEvent, index: number): void {
        if (event.key === 'Escape') {
            if (this.tooltipIndex() !== null || this.pointer || this.keyboardStart !== null) {
                event.stopPropagation();
                event.preventDefault();
            }

            if (this.pointer || this.keyboardStart !== null) {
                this.cancelGesture();
            }

            this.clearTooltip();

            return;
        }

        const keys = ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'];

        if (!keys.includes(event.key) || event.altKey || event.ctrlKey || event.metaKey) return;
        event.preventDefault();
        if (this.disabled() || this.readonly() || this.pointer) return;
        this.animateMark.set(false);
        this.keyboardStart ??= this.value();
        this.activeIndex.set(index);
        let direction = event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'PageUp' ? 1 : -1;

        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            if (!this.vertical() && this.direction() === 'rtl') direction *= -1;
            if (this.reversed()) direction *= -1;
        } else if (this.reversed() && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) direction *= -1;
        const page = event.key.startsWith('Page') || event.shiftKey ? Math.max(1, Math.floor(this.pageStep())) : 1;
        let next = this.thumbValue(index) + direction * this.bounds().step * page;

        if (this.step() === null) {
            const stops = sliderStops(this.settings());
            const current = stops.indexOf(this.thumbValue(index));

            next = stops[Math.max(0, Math.min(stops.length - 1, current + direction * page))] ?? this.bounds().min;
        }

        if (event.key === 'Home') next = this.thumbMin(index);
        if (event.key === 'End') next = this.thumbMax(index);
        const nextIndex = this.move(index, next);

        this.activeIndex.set(nextIndex);
        if (nextIndex !== index) this.focus({ preventScroll: true }, nextIndex);
        this.revealTooltip(nextIndex);
    }

    protected onKeyUp(event: KeyboardEvent): void {
        if (
            ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(event.key)
        )
            this.finishKeyboard();
    }

    protected onNativeInput(event: Event, index: number): void {
        const input = event.target as HTMLInputElement;

        if (this.disabled() || this.readonly()) {
            input.value = String(this.thumbValue(index));

            return;
        }

        if (this.pointer) return;
        this.animateMark.set(false);
        const start = this.value();

        const current = this.thumbValue(index);
        let next = input.valueAsNumber;

        if (this.step() === null && next !== current && sliderSnap(next, this.settings()) === current) {
            const stops = sliderStops(this.settings());

            next = stops[stops.indexOf(current) + Math.sign(next - current)] ?? current;
        }

        const active = this.move(index, next);

        input.value = String(this.thumbValue(index));
        if (active !== index) this.focus({ preventScroll: true }, active);

        if (!sliderEqual(start, this.value())) {
            this.valueCommit.emit({ value: this.value(), source: 'input' });
            this.revealTooltip(active);
            this.onTouched();
        }
    }

    protected onThumbFocus(index: number): void {
        this.activeIndex.set(index);
        this.revealTooltip(index);
    }

    protected onFocusOut(event: FocusEvent): void {
        if (this.element.nativeElement.contains(event.relatedTarget as Node | null)) return;
        this.focused.set(false);
        this.finishKeyboard();
        if (this.pointer) this.cancelGesture();
        this.clearTooltip();
        this.onTouched();
    }

    private nearest(value: number): number {
        const values = this.values();

        if (values.length === 1) return 0;
        const lower = Math.abs(this.position(values[0]) - this.position(value));
        const upper = Math.abs(this.position(values[1]) - this.position(value));

        if (lower === upper) {
            if (values[0] === values[1] && value !== values[0]) return value > values[0] ? 1 : 0;

            return this.activeIndex();
        }

        return lower < upper ? 0 : 1;
    }

    private pointerPosition(event: PointerEvent): number {
        const rect = this.rail()?.nativeElement.getBoundingClientRect();

        if (!rect) return 0;
        const size = this.vertical() ? rect.height : rect.width;

        return size <= 0 ? 0 : ((this.vertical() ? event.clientY - rect.top : event.clientX - rect.left) / size) * 100;
    }

    private valueAt(event: PointerEvent, offset = 0): number {
        let fraction = Math.max(0, Math.min(1, (this.pointerPosition(event) + offset) / 100));

        if (this.isFlipped()) fraction = 1 - fraction;

        return (
            this.scale()?.toValue(fraction) ?? this.bounds().min + fraction * (this.bounds().max - this.bounds().min)
        );
    }

    private updateFromPointer(value: number): void {
        const index = this.activeIndex();
        const nextIndex = this.move(index, value);

        this.activeIndex.set(nextIndex);
        if (nextIndex !== index) this.focus({ preventScroll: true }, nextIndex);
        this.revealTooltip(nextIndex);
    }

    private finishKeyboard(): void {
        if (this.keyboardStart === null) return;
        const start = this.keyboardStart;

        this.keyboardStart = null;
        this.onTouched();
        if (!sliderEqual(start, this.value())) this.valueCommit.emit({ value: this.value(), source: 'keyboard' });
    }

    private releasePointer(): void {
        const pointer = this.pointer;

        this.pointer = null;
        this.dragging.set(false);
        if (pointer && this.surface()?.nativeElement.hasPointerCapture(pointer.id))
            this.surface()?.nativeElement.releasePointerCapture(pointer.id);
    }

    private cancelGesture(): void {
        const start = this.pointer?.start ?? this.keyboardStart;

        this.releasePointer();
        this.keyboardStart = null;
        if (start !== null && start !== undefined) this.changeValue(start);
        this.clearTooltip();
    }

    private revealTooltip(index: number): void {
        if (this.disabled() || (!this.showTooltip() && !this.tooltipOnFocus())) return;
        this.clearTooltip();
        this.tooltipIndex.set(index);
    }

    protected hover(index: number): void {
        if (!this.showTooltip() || this.disabled() || this.pointer || this.tooltipIndex() === index) return;
        clearTimeout(this.tooltipTimer);
        this.tooltipTimer = setTimeout(() => this.revealTooltip(index), 400);
    }

    protected leave(index: number): void {
        clearTimeout(this.tooltipTimer);
        if (!this.pointer && !(this.focused() && this.activeIndex() === index)) this.clearTooltip();
    }

    protected finishMarkAnimation(): void {
        this.animateMark.set(false);
        const index = this.tooltipIndex();

        if (index !== null) this.tooltips()[index]?.overlayRef?.updatePosition();
    }

    protected selectMark(value: number): void {
        if (this.disabled() || this.readonly()) return;
        const index = this.nearest(value);
        const start = this.value();

        this.animateMark.set(true);
        const active = this.move(index, value);

        if (sliderEqual(start, this.value())) return;
        this.focus({ preventScroll: true }, active);
        this.onTouched();
        this.valueCommit.emit({ value: this.value(), source: 'pointer' });
    }

    override writeValue(value: KbqSliderValue | null): void {
        this.releasePointer();
        this.keyboardStart = null;
        this.clearTooltip();
        this.animateMark.set(false);
        super.writeValue(value);
    }

    private clearTooltip(): void {
        clearTimeout(this.tooltipTimer);
        this.tooltipIndex.set(null);
    }
}
