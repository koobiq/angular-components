import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    ElementRef,
    forwardRef,
    inject,
    input,
    signal,
    untracked,
    viewChild,
    viewChildren,
    ViewEncapsulation
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { ErrorStateMatcher } from '@koobiq/components/core';
import { KbqLocaleOverridesDirective } from '@koobiq/components/core';
import { KbqFormFieldControl, KbqFormFieldModule } from '@koobiq/components/form-field';
import { add, KbqInputModule, KbqNumberInput } from '@koobiq/components/input';
import { KbqSlider } from './slider';
import type { KbqSliderCommit, KbqSliderValue } from './slider.types';
import { KbqSliderBase } from './slider-base';
import { sliderEqual, sliderMove, sliderSnap, sliderStops } from './slider-value';

/** Numeric input and slider sharing a single value or range. */
@Component({
    selector: 'kbq-input-slider',
    imports: [FormsModule, KbqInputModule, KbqFormFieldModule, KbqSlider],
    templateUrl: './input-slider.html',
    styleUrl: './input-slider.scss',
    providers: [{ provide: KbqFormFieldControl, useExisting: forwardRef(() => KbqInputSlider) }],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-input-slider',
        '[attr.id]': 'id()',
        '[class.kbq-disabled]': 'disabled()',
        '[class.kbq-invalid]': 'errorState()',
        '(focusin)': 'focused.set(true)',
        '(focusout)': 'onFocusOut($event)'
    },
    hostDirectives: [{ directive: KbqLocaleOverridesDirective, inputs: ['kbqLocaleOverrides: localeOverrides'] }],
    exportAs: 'kbqInputSlider'
})
export class KbqInputSlider<T extends KbqSliderValue = KbqSliderValue> extends KbqSliderBase<T> {
    /** Unit displayed after each numeric value. */
    readonly unit = input('');
    /** Shows stepper buttons for a single value. Defaults to `true`. */
    readonly showStepper = input<boolean, boolean | string | null | undefined>(true, { transform: booleanAttribute });
    /** @docs-private */
    readonly controlType = 'input-slider';
    private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly slider = viewChild(KbqSlider);
    private readonly inputs = viewChildren(KbqNumberInput);
    protected readonly formatValue = (value: number): string =>
        this.unit() && this.displayWith() === this.defaultFormat
            ? `${value} ${this.unit()}`
            : this.displayWith()(value);
    protected readonly stepValue = (value: number, delta: number): number => {
        const settings = this.settings();
        const current = sliderSnap(value, settings);

        if (settings.step !== null) return add(current, delta);
        const stops = sliderStops(settings);
        const index = Math.max(0, Math.min(stops.length - 1, stops.indexOf(current) + delta));

        return stops[index] ?? current;
    };
    protected readonly bigStep = computed(() => 10 * this.bounds().step);
    protected readonly drafts = signal<(number | null)[]>([0]);
    protected readonly numberErrorMatcher: ErrorStateMatcher = { isErrorState: () => this.errorState() };
    private editingIndex: number | null = null;
    private editStart: KbqSliderValue | null = null;

    constructor() {
        super();
        effect(() => {
            const values = this.values();

            untracked(() =>
                this.drafts.update((drafts) =>
                    values.map((value, index) => (index === this.editingIndex ? (drafts[index] ?? null) : value))
                )
            );
        });
    }

    /** Focuses the first numeric input. */
    override focus(options?: FocusOptions): void {
        this.element.nativeElement.querySelector<HTMLInputElement>('input.kbq-input')?.focus(options);
    }
    /** @docs-private */
    onContainerClick(event: MouseEvent): void {
        if (!this.element.nativeElement.contains(event.target as Node)) this.focus();
    }

    protected beginEdit(index: number): void {
        this.editingIndex = index;
    }

    protected startDraft(): KbqSliderValue {
        return (this.editStart ??= this.value());
    }

    protected edit(value: number | null, index: number): void {
        const start = this.startDraft();

        this.drafts.update((drafts) => drafts.map((draft, i) => (i === index ? value : draft)));
        if (value === null || !Number.isFinite(value) || this.readonly() || this.disabled()) return;
        const result = sliderMove(start, index, value, this.settings(), this.collision());

        // Keep a crossing draft in its original field until the user finishes editing.
        if (result.index === index) this.changeValue(result.value);
    }

    protected finishEdit(index: number): number {
        const start = this.editStart;

        const typed = this.inputs()[index]?.valueAsNumber;

        const result =
            start !== null && typed != null && Number.isFinite(typed) && !this.disabled() && !this.readonly()
                ? sliderMove(start, index, typed, this.settings(), this.collision())
                : null;

        if (result) this.changeValue(result.value);

        this.editStart = null;
        this.editingIndex = null;
        this.drafts.set([...this.values()]);
        this.refreshInput(index);
        if (start !== null && !sliderEqual(start, this.value()))
            this.valueCommit.emit({ value: this.value(), source: 'input' });

        return result?.index ?? index;
    }

    protected onEditorKey(event: KeyboardEvent, index: number): void {
        if (event.key === 'Enter') {
            const active = this.finishEdit(index);

            if (active === index) this.beginEdit(index);
            else this.element.nativeElement.querySelectorAll<HTMLInputElement>('input.kbq-input')[active]?.focus();

            return;
        }

        if (event.key !== 'Escape' || this.editStart === null) return;
        event.preventDefault();
        this.changeValue(this.editStart);
        this.editStart = null;
        this.drafts.set([...this.values()]);
        this.refreshInput(index);
    }

    override writeValue(value: KbqSliderValue | null): void {
        super.writeValue(value);
        this.slider()?.writeValue(this.value());
        this.editStart = null;
        this.drafts.set([...this.values()]);
        this.inputs().forEach((_, index) => this.refreshInput(index));
    }

    protected onSliderValue(value: KbqSliderValue): void {
        this.changeValue(value);
        this.drafts.set([...this.values()]);
        this.editStart = null;

        if (this.editingIndex !== null) this.refreshInput(this.editingIndex);
    }

    private refreshInput(index: number): void {
        const input = this.inputs()[index];

        input?.setCommittedValue(this.thumbValue(index));
    }

    protected onSliderCommit(event: KbqSliderCommit): void {
        this.valueCommit.emit(event);
    }

    protected onFocusOut(event: FocusEvent): void {
        if (!this.element.nativeElement.contains(event.relatedTarget as Node | null)) {
            this.focused.set(false);
            this.onTouched();
        }
    }
}
