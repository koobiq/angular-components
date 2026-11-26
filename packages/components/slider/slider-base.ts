import { _IdGenerator, FocusMonitor } from '@angular/cdk/a11y';
import type { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
    afterNextRender,
    booleanAttribute,
    computed,
    DestroyRef,
    Directive,
    type DoCheck,
    ElementRef,
    inject,
    input,
    numberAttribute,
    type OnChanges,
    output,
    Renderer2,
    signal,
    type SimpleChanges
} from '@angular/core';
import { type ControlValueAccessor, FormGroupDirective, NgControl, NgForm, Validators } from '@angular/forms';
import {
    ErrorStateMatcher,
    KBQ_A11Y_LOCALE_CONFIGURATION,
    KbqErrorStateTracker,
    KbqLocaleOverridesDirective,
    ruRULocaleData
} from '@koobiq/components/core';
import { KBQ_FORM_FIELD, KbqFormFieldControl } from '@koobiq/components/form-field';
import type {
    KbqSliderCommit,
    KbqSliderMark,
    KbqSliderSelection,
    KbqSliderThumbCollisionBehavior,
    KbqSliderValue
} from './slider.types';
import { KBQ_SLIDER_OPTIONS } from './slider-options';
import { sliderBounds, sliderEqual, sliderGap, sliderMove, sliderNormalize, sliderSnap } from './slider-value';

/**
 * Shared form and value contract of the slider and input slider.
 *
 * @docs-private
 */
@Directive()
export abstract class KbqSliderBase<T extends KbqSliderValue = KbqSliderValue>
    implements ControlValueAccessor, DoCheck, OnChanges
{
    /** Defaults inherited from the current injector. @docs-private */
    protected readonly options = inject(KBQ_SLIDER_OPTIONS);
    private readonly uid = inject(_IdGenerator).getId('kbq-slider-');

    /** Associated Angular form control, if present. @docs-private */
    readonly ngControl = inject(NgControl, { optional: true, self: true });
    private readonly parentFormField = inject(KBQ_FORM_FIELD, { optional: true, host: true });
    protected readonly locale = inject(KbqLocaleOverridesDirective, { self: true }).read(
        'a11y',
        KBQ_A11Y_LOCALE_CONFIGURATION
    );
    protected readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
    protected readonly focusMonitor = inject(FocusMonitor);
    private readonly destroyRef = inject(DestroyRef);

    /** Selected number or ordered range. Defaults to `0`. */
    readonly valueInput = input<T>(undefined, { alias: 'value' });

    /** Lower bound of the scale. Defaults to `0`. */
    readonly min = input<number, NumberInput>(this.options.min, { transform: numberAttribute });

    /** Upper bound of the scale. Defaults to `100`. */
    readonly max = input<number, NumberInput>(this.options.max, { transform: numberAttribute });

    /** Positive step anchored at `min`, or `null` to select only marks. Defaults to `1`. */
    readonly step = input<number | null, NumberInput>(this.options.step, {
        transform: (value: NumberInput) => (value === null ? null : numberAttribute(value))
    });

    /** Visual marks, independent of the numeric step. Defaults to an empty list. */
    readonly marks = input<readonly KbqSliderMark[]>(this.options.marks);

    /** Minimum separation of range bounds in value units. Defaults to `0`. */
    readonly minDistance = input<number, NumberInput>(this.options.minDistance, { transform: numberAttribute });

    /** Range collision strategy for pointer, keyboard and numeric input. Defaults to `'none'`. */
    readonly thumbCollisionBehavior = input<KbqSliderThumbCollisionBehavior>(this.options.thumbCollisionBehavior);

    /** Whether user input is disabled. Defaults to `false`. */
    readonly disabledInput = input<boolean, BooleanInput>(this.options.disabled, {
        alias: 'disabled',
        transform: booleanAttribute
    });

    /** Whether the value is read-only while the thumbs remain focusable. Defaults to `false`. */
    readonly readonly = input<boolean, BooleanInput>(this.options.readonly, { transform: booleanAttribute });

    /** Controls when Angular validation errors appear. Defaults to the injected matcher. */
    readonly errorStateMatcher = input<ErrorStateMatcher>();

    /** Accessible name, used when no labelled-by reference is supplied. Defaults to the active locale. */
    readonly ariaLabel = input<string>('', { alias: 'aria-label' });

    /** Space-separated IDs of elements naming the control. Defaults to `null`. */
    readonly ariaLabelledby = input<string | null>(null, { alias: 'aria-labelledby' });

    /** Space-separated IDs of descriptions. Defaults to `null`. */
    readonly ariaDescribedby = input<string | null>(null, { alias: 'aria-describedby' });

    /** Individual accessible names of range bounds. Defaults to localized lower/upper bound names. */
    readonly thumbAriaLabels = input<readonly string[]>([]);

    protected readonly defaultFormat = (value: number): string => String(value);
    /** Formats the tooltip and accessible value text. Defaults to the numeric string. */
    readonly displayWith = input<(value: number) => string>(this.options.displayWith ?? this.defaultFormat);

    /** Base name used to serialize the value; range bounds use `name[0]` and `name[1]`. Defaults to `null`. */
    readonly name = input<string | null>(null);

    /** Element ID. Generated when empty or omitted. */
    readonly idInput = input<string | undefined>(undefined, { alias: 'id' });

    /** @docs-private */
    readonly requiredInput = input<boolean, BooleanInput>(this.options.required, {
        alias: 'required',
        transform: booleanAttribute
    });

    /** Emits a new selection when the user edits the control. */
    readonly valueChange = output<KbqSliderSelection<T>>();

    /** Emits once when a changed user interaction completes. */
    readonly valueCommit = output<KbqSliderCommit>();

    private readonly current = signal<KbqSliderValue>(0);
    private readonly formDisabled = signal<boolean | undefined>(undefined);
    private readonly errorTracker = new KbqErrorStateTracker(
        inject(ErrorStateMatcher),
        this.ngControl,
        inject(FormGroupDirective, { optional: true }),
        inject(NgForm, { optional: true })
    );
    private readonly requiredValidator = signal(false);

    protected readonly settings = computed(() => ({
        min: this.min(),
        max: this.max(),
        step: this.step(),
        marks: this.marks(),
        minDistance: this.minDistance()
    }));

    /** Current selection on the configured scale. */
    readonly value = computed(() => sliderNormalize(this.current(), this.settings()) as KbqSliderSelection<T>);

    /** Effective ID used by the host and its accessible labels. */
    readonly id = computed(() => this.idInput() || this.uid);

    /** Effective disabled state, including Angular forms. */
    readonly disabled = computed(() => this.formDisabled() ?? this.disabledInput());

    /** Whether the control displays a validation error. */
    readonly errorState = this.errorTracker.errorState;

    /** Whether any descendant is focused. @docs-private */
    readonly focused = signal(false);

    /** @docs-private */
    readonly empty = signal(false);

    /** Whether a value is required by the field or its Angular validator. */
    readonly required = computed(() => this.requiredInput() || this.requiredValidator());

    /** @docs-private */
    readonly placeholder = signal(null);

    /** @docs-private */
    readonly isNativeLabelSupported = false;
    protected readonly labelledBy = computed(() => this.ariaLabelledby() || this.parentFormField?.labelId() || null);
    protected readonly describedByIds = signal<string[]>([]);
    protected readonly description = computed(
        () => [this.ariaDescribedby(), ...this.describedByIds()].filter(Boolean).join(' ') || null
    );
    protected readonly bounds = computed(() => sliderBounds(this.settings()));
    protected readonly values = computed<readonly [number] | readonly [number, number]>(() => {
        const value = this.value();

        return typeof value === 'number' ? [value] : value;
    });

    constructor() {
        if (this.ngControl) this.ngControl.valueAccessor = this;

        this.monitorFocus();
        this.monitorNativeFormReset();
    }

    /** @docs-private */
    ngOnChanges(changes: SimpleChanges<KbqSliderBase>): void {
        if (changes.valueInput && !this.ngControl) this.syncValueInput(this.valueInput() ?? 0);
    }

    /** @docs-private */
    ngDoCheck(): void {
        this.requiredValidator.set(this.ngControl?.control?.hasValidator(Validators.required) ?? false);
        this.errorTracker.errorStateMatcher = this.errorStateMatcher();
        this.errorTracker.updateErrorState();
    }

    protected thumbValue(index: number): number {
        const values = this.values();

        return values.length === 2 && index === 1 ? values[1] : values[0];
    }

    protected onChange: (value: KbqSliderValue) => void = () => {};

    protected onTouched: () => void = () => {};

    private monitorFocus(): void {
        this.focusMonitor.monitor(this.element, true).subscribe((origin) => {
            this.focused.set(!!origin);

            if (!origin) {
                this.finishInteraction();
                this.onTouched();
            }
        });
        this.destroyRef.onDestroy(() => this.focusMonitor.stopMonitoring(this.element));
    }

    private monitorNativeFormReset(): void {
        const parent = inject(KbqFormFieldControl, { optional: true, skipSelf: true });

        if (this.ngControl || parent instanceof KbqSliderBase) return;

        const renderer = inject(Renderer2);

        afterNextRender(() => this.listenForNativeFormReset(renderer));
    }

    private listenForNativeFormReset(renderer: Renderer2): void {
        const form = this.element.nativeElement.closest('form');

        if (!form) return;
        const initial = this.value();
        const stop = renderer.listen(form, 'reset', (event: Event) => {
            // A reset dispatched by the browser can run microtasks before restoring the native inputs.
            setTimeout(() => {
                if (!event.defaultPrevented && !this.destroyRef.destroyed) this.restoreInitialValue(initial);
            });
        });

        this.destroyRef.onDestroy(stop);
    }

    private restoreInitialValue(initial: KbqSliderValue): void {
        const previous = this.value();

        this.writeValue(initial);
        if (!sliderEqual(previous, this.value())) this.valueChange.emit(this.value());
    }

    private syncValueInput(value: KbqSliderValue): void {
        // A two-way binding can echo a value while a gesture or a draft is still active.
        if (sliderEqual(this.value(), sliderNormalize(value, this.settings()))) this.current.set(value);
        else this.writeValue(value);
    }

    /** Writes a form value without emitting a user change. @docs-private */
    writeValue(value: KbqSliderValue | null): void {
        this.current.set(
            value ?? (typeof this.value() === 'number' ? this.bounds().min : [this.bounds().min, this.bounds().max])
        );
    }

    /** @docs-private */
    registerOnChange(fn: (value: KbqSliderValue) => void): void {
        this.onChange = fn;
    }

    /** @docs-private */
    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    /** @docs-private */
    setDisabledState(disabled: boolean): void {
        this.formDisabled.set(disabled);
    }

    /** @docs-private */
    setDescribedByIds(ids: string[]): void {
        this.describedByIds.set(ids);
    }

    protected changeValue(value: KbqSliderValue): void {
        value = sliderNormalize(value, this.settings());

        if (!sliderEqual(this.value(), value)) {
            this.current.set(value);
            const selection = this.value();

            this.onChange(selection);
            this.valueChange.emit(selection);
        }
    }

    protected move(index: number, value: number): number {
        if (this.disabled() || this.readonly()) return index;
        const result = sliderMove(this.value(), index, value, this.settings(), this.thumbCollisionBehavior());

        this.changeValue(result.value);

        return result.index;
    }

    protected thumbMin(index: number): number {
        const min = sliderSnap(this.bounds().min, this.settings());

        if (index !== 1 || this.thumbCollisionBehavior() === 'swap') return min;
        const lower = this.thumbCollisionBehavior() === 'push' ? min : this.thumbValue(0);

        return sliderSnap(lower + sliderGap(this.settings()), this.settings(), 1);
    }

    protected thumbMax(index: number): number {
        const max = sliderSnap(this.bounds().max, this.settings(), -1);

        if (this.values().length === 1 || index !== 0 || this.thumbCollisionBehavior() === 'swap') return max;
        const upper = this.thumbCollisionBehavior() === 'push' ? max : this.thumbValue(1);

        return sliderSnap(upper - sliderGap(this.settings()), this.settings(), -1);
    }

    protected thumbLabel(index: number): string {
        const label = this.thumbAriaLabels()[index];

        const { slider, sliderStart, sliderEnd } = this.locale();

        if (this.values().length === 1) return label || this.ariaLabel() || slider || ruRULocaleData.a11y.slider;
        if (label) return label;

        return [
            this.ariaLabel(),
            index === 0
                ? (sliderStart ?? ruRULocaleData.a11y.sliderStart)
                : (sliderEnd ?? ruRULocaleData.a11y.sliderEnd)
        ]
            .filter(Boolean)
            .join(' ');
    }

    protected thumbLabelledBy(index: number): string | null {
        const labelledBy = this.labelledBy();

        return labelledBy && this.values().length === 2
            ? `${labelledBy} ${this.id()}-thumb-${index}-label`
            : labelledBy;
    }

    protected inputName(index: number): string | null {
        const name = this.name();

        return name && this.values().length === 2 ? `${name}[${index}]` : name;
    }

    protected abstract finishInteraction(): void;

    /** Focuses the first interactive element. */
    abstract focus(options?: FocusOptions): void;

    /** @docs-private */
    abstract onContainerClick(event: MouseEvent): void;
}
