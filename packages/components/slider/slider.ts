import { InputModalityDetector } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { Overlay } from '@angular/cdk/overlay';
import { Platform } from '@angular/cdk/platform';
import {
    afterNextRender,
    afterRenderEffect,
    type AfterRenderRef,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    effect,
    ElementRef,
    forwardRef,
    inject,
    Injector,
    input,
    Renderer2,
    signal,
    untracked,
    viewChild,
    viewChildren,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KBQ_WINDOW, kbqAnimationsDisabled } from '@koobiq/components/core';
import { KbqFormFieldControl } from '@koobiq/components/form-field';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import type { KbqSliderFill, KbqSliderScale, KbqSliderValue } from './slider.types';
import { KbqSliderBase } from './slider-base';
import { sliderEqual, sliderMove, sliderSnap, sliderStops } from './slider-value';

interface SliderMarkAnimation {
    index: number;
    animations: Animation[];
    fillSizes: { element: HTMLElement; property: string }[];
    render?: AfterRenderRef;
    frame?: number;
}

const MARK_ANIMATION_TIMING: KeyframeAnimationOptions = {
    duration: 120,
    easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
    fill: 'both'
};

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
    /** Shows the value on focus even when `showTooltip` is off. Defaults to `false`. */
    readonly tooltipOnFocus = input<boolean, boolean | string | null | undefined>(false, {
        transform: booleanAttribute
    });
    /** Number of steps advanced by Page Up/Down. Defaults to `10`. */
    readonly pageStep = input(10);
    /** @docs-private */
    readonly controlType = 'slider';

    private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly platform = inject(Platform);
    private readonly injector = inject(Injector);
    private readonly modality = inject(InputModalityDetector);
    private readonly overlay = inject(Overlay);
    protected readonly tooltipScrollStrategy = () => this.overlay.scrollStrategies.reposition();
    private readonly directionality = inject(Directionality, { optional: true });
    private readonly direction = signal(this.directionality?.value ?? 'ltr');
    private readonly renderer = inject(Renderer2);
    private readonly window = inject(KBQ_WINDOW);
    private readonly rail = viewChild<ElementRef<HTMLElement>>('rail');
    private readonly surface = viewChild<ElementRef<HTMLElement>>('surface');
    protected readonly animationsDisabled = kbqAnimationsDisabled();
    protected readonly animateMark = signal(false);
    protected readonly activeIndex = signal(0);
    protected readonly tooltipIndex = signal<number | null>(null);
    protected readonly visibleMarks = computed(() =>
        this.marks().filter(
            (mark) => Number.isFinite(mark.value) && mark.value >= this.bounds().min && mark.value <= this.bounds().max
        )
    );
    protected readonly hasMarkLabels = computed(() => this.visibleMarks().some((mark) => !!mark.label));
    private readonly filledRanges = computed<readonly (readonly [number, number])[]>(() => {
        const values = this.values();
        const { min, max } = this.bounds();
        const fill = this.fill();

        if (fill === 'none') return [];

        if (values.length === 2) {
            return fill === 'outside'
                ? [
                      [min, values[0]],
                      [values[1], max]
                  ]
                : [[values[0], values[1]]];
        }

        if (fill === 'end' || fill === 'outside') return [[values[0], max]];
        if (fill === 'origin') return [[this.fillOrigin(), values[0]]];

        return [[min, values[0]]];
    });

    protected readonly segments = computed(() =>
        this.filledRanges().map(([a, b]) => {
            const first = this.position(a);
            const second = this.position(b);
            const end = Math.max(first, second);

            const start = Math.min(first, second);
            const size = end - start;
            const inset = 'var(--kbq-slider-inset)';

            return {
                // Keep a collapsing fill anchored to the outer track edge.
                start: `calc(${start}% - ${start === 0 ? inset : '0px'} + ${start === 100 ? inset : '0px'})`,
                size: `calc(${size}% + ${size > 0 && end < 100 ? 'var(--kbq-slider-fill-extension, 0px)' : '0px'} + ${size > 0 && start === 0 ? inset : '0px'} + ${size > 0 && end === 100 ? inset : '0px'})`
            };
        })
    );
    private pointer: { id: number; start: KbqSliderValue; offset: number; overlapped: boolean } | null = null;
    private keyboardStart: KbqSliderValue | null = null;
    private readonly tooltips = viewChildren(KbqTooltipTrigger);
    protected readonly dragging = signal(false);

    private tooltipTimer: ReturnType<typeof setTimeout> | undefined;
    private markAnimation?: SliderMarkAnimation;

    constructor() {
        super();
        this.modality.modalityDetected
            .pipe(takeUntilDestroyed())
            .subscribe((modality) => this.setPointerMotion(modality === 'mouse' || modality === 'touch'));
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
            this.thumbAlignment();
            this.fill();
            this.fillOrigin();
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
        });
        destroyRef.onDestroy(() => {
            this.finishMarkAnimation();
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

    protected isMarkFilled(value: number): boolean {
        return this.filledRanges().some(([start, end]) => value > Math.min(start, end) && value < Math.max(start, end));
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

    private setPointerMotion(enabled: boolean): void {
        // Apply the modality before the browser moves focus on Tab.
        this.element.nativeElement.classList.toggle('kbq-slider_pointer-motion', enabled);
    }

    protected onPointerDown(event: PointerEvent): void {
        if (!this.platform.isBrowser) return;

        const target = event.target as HTMLElement;

        if (target.closest('.kbq-slider__mark-label')) {
            event.stopPropagation();
            event.preventDefault();
            if (event.isPrimary && event.button === 0) this.setPointerMotion(true);

            return;
        }

        if (this.disabled() || this.pointer || event.button !== 0 || !event.isPrimary) return;

        this.setPointerMotion(true);
        this.finishMarkAnimation();
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
        if (!sliderEqual(start, this.value())) this.valueCommit.emit({ value: this.value(), source: 'pointer' });
    }

    protected onPointerCancel(event: PointerEvent): void {
        if (this.pointer?.id === event.pointerId) this.cancelGesture();
    }

    protected onKeyDown(event: KeyboardEvent, index: number): void {
        if (event.key === 'Escape') {
            if (this.tooltipIndex() !== null || this.markAnimation || this.pointer || this.keyboardStart !== null) {
                event.stopPropagation();
                event.preventDefault();
            }

            if (this.pointer || this.keyboardStart !== null) {
                this.cancelGesture();
            }

            this.finishMarkAnimation();
            this.clearTooltip();

            return;
        }

        const keys = ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'];

        if (!keys.includes(event.key) || event.altKey || event.ctrlKey || event.metaKey) return;
        event.preventDefault();
        if (this.disabled() || this.readonly() || this.pointer) return;
        this.finishMarkAnimation();
        this.keyboardStart ??= this.value();
        this.activeIndex.set(index);
        let direction = event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'PageUp' ? 1 : -1;

        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            if (!this.vertical() && this.direction() === 'rtl') direction *= -1;
            if (this.reversed()) direction *= -1;
        } else if (this.vertical() && this.reversed() && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
            direction *= -1;
        }

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
        this.finishMarkAnimation();
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
        }
    }

    protected onThumbFocus(index: number): void {
        this.activeIndex.set(index);
        this.focused.set(true);
        if (this.markAnimation?.index === index) return;

        this.finishMarkAnimation();
        this.revealTooltip(index);
    }

    protected onFocusOut(event: FocusEvent): void {
        if (this.element.nativeElement.contains(event.relatedTarget as Node | null)) return;
        this.focused.set(false);
        this.finishMarkAnimation();
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
        this.finishMarkAnimation();
        const start = this.pointer?.start ?? this.keyboardStart;

        this.releasePointer();
        this.keyboardStart = null;
        if (start !== null && start !== undefined) this.changeValue(start);
        this.clearTooltip();
    }

    private revealTooltip(index: number): void {
        if (this.disabled() || !(this.showTooltip() || (this.tooltipOnFocus() && this.focused()))) return;
        this.clearTooltip();
        this.tooltipIndex.set(index);
    }

    protected hover(index: number): void {
        if (
            !this.showTooltip() ||
            this.disabled() ||
            this.pointer ||
            this.markAnimation ||
            this.tooltipIndex() === index
        )
            return;
        clearTimeout(this.tooltipTimer);
        this.tooltipTimer = setTimeout(() => this.revealTooltip(index), 400);
    }

    protected leave(index: number): void {
        clearTimeout(this.tooltipTimer);
        if (!this.pointer && !(this.focused() && this.activeIndex() === index)) this.clearTooltip();
    }

    protected finishMarkAnimation(): void {
        const motion = this.markAnimation;

        if (!motion) return;
        this.markAnimation = undefined;
        motion.render?.destroy();
        if (motion.frame !== undefined) this.window.cancelAnimationFrame(motion.frame);
        for (const animation of motion.animations) animation.cancel();
        for (const { element, property } of motion.fillSizes) element.style.removeProperty(property);
        this.animateMark.set(false);
    }

    protected selectMark(value: number): void {
        if (this.disabled() || this.readonly() || this.pointer) return;

        const start = this.value();
        const next = sliderMove(start, this.nearest(value), value, this.settings(), this.collision());

        if (sliderEqual(start, next.value)) return;

        this.prepareMarkAnimation(next.index);
        this.changeValue(next.value);
        this.focus({ preventScroll: true }, next.index);
        if (!this.markAnimation) this.revealTooltip(next.index);
        this.valueCommit.emit({ value: this.value(), source: 'pointer' });
    }

    private prepareMarkAnimation(index: number): void {
        const rail = this.rail()?.nativeElement;

        if (
            !this.platform.isBrowser ||
            typeof rail?.animate !== 'function' ||
            this.animationsDisabled ||
            this.window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
        ) {
            this.finishMarkAnimation();

            return;
        }

        const vertical = this.vertical();
        const snapshots = Array.from(rail.querySelectorAll<HTMLElement>('.kbq-slider__thumb, .kbq-slider__fill')).map(
            (element) => ({ element, before: element.getBoundingClientRect() })
        );

        // Take the measurements before cancelling so a second click starts at the current visual position.
        this.finishMarkAnimation();
        if (this.tooltipIndex() !== index || !this.tooltips()[index]?.overlayRef?.hasAttached()) this.clearTooltip();

        const motion: SliderMarkAnimation = { index, animations: [], fillSizes: [] };

        this.markAnimation = motion;
        this.animateMark.set(true);
        motion.render = afterNextRender(
            () => {
                const geometry = snapshots.map(({ element, before }) => ({
                    element,
                    before,
                    after: element.getBoundingClientRect()
                }));

                for (const { element, before, after } of geometry) {
                    const start = vertical ? before.top : before.left;
                    const end = vertical ? after.top : after.left;
                    const translate = (distance: number): string =>
                        vertical ? '0px ' + distance + 'px' : distance + 'px';

                    if (element.classList.contains('kbq-slider__thumb')) {
                        if (start !== end) {
                            motion.animations.push(
                                element.animate({ translate: [translate(start - end), '0px'] }, MARK_ANIMATION_TIMING)
                            );
                        }

                        continue;
                    }

                    const from = vertical ? before.height : before.width;
                    const to = vertical ? after.height : after.width;

                    if ((from === 0 && to === 0) || (start === end && from === to)) continue;

                    // Keep enough of the fill laid out to collapse it all the way to zero with transforms.
                    const size = Math.max(from, to);

                    if (size > to) {
                        const property = vertical ? 'min-height' : 'min-width';

                        element.style.setProperty(property, size + 'px');
                        motion.fillSizes.push({ element, property });
                    }

                    const scale = (length: number): string => (vertical ? '1 ' + length / size : length / size + ' 1');

                    // Interpolate both ends together. A fixed outer end stays fixed even when the fill collapses.
                    motion.animations.push(
                        element.animate(
                            {
                                translate: [translate(start - end + (from - size) / 2), translate((to - size) / 2)],
                                scale: [scale(from), scale(to)]
                            },
                            MARK_ANIMATION_TIMING
                        )
                    );
                }

                const complete = (): void => {
                    if (this.markAnimation !== motion) return;

                    this.finishMarkAnimation();
                    if (this.focused() && this.activeIndex() === index) this.revealTooltip(index);
                    this.tooltips()[index]?.overlayRef?.updatePosition();
                };

                if (!motion.animations.length) return complete();

                this.followMarkTooltip(motion);
                void Promise.allSettled(motion.animations.map(({ finished }) => finished)).then(complete);
            },
            { injector: this.injector }
        );
    }

    private followMarkTooltip(motion: SliderMarkAnimation): void {
        const overlay = this.tooltips()[motion.index]?.overlayRef;

        if (this.markAnimation !== motion || this.tooltipIndex() !== motion.index || !overlay?.hasAttached()) return;

        overlay.updatePosition();
        motion.frame = this.window.requestAnimationFrame(() => this.followMarkTooltip(motion));
    }

    override writeValue(value: KbqSliderValue | null): void {
        this.releasePointer();
        this.keyboardStart = null;
        this.clearTooltip();
        this.finishMarkAnimation();
        super.writeValue(value);
    }

    private clearTooltip(): void {
        clearTimeout(this.tooltipTimer);
        this.tooltipIndex.set(null);
    }
}
