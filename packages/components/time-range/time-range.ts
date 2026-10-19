import { DOCUMENT } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    inject,
    InjectionToken,
    input,
    OnInit,
    output,
    Provider,
    Signal,
    signal,
    TemplateRef,
    untracked,
    ViewEncapsulation,
    WritableSignal
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormControl, NgControl, ReactiveFormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    KbqDeepPartial,
    kbqLocaleConfigurationOverrideProvider,
    KbqLocaleOverridesDirective,
    KbqTimeRangeLocaleConfiguration,
    PopUpPlacements,
    PopUpSizes,
    ruRULocaleData
} from '@koobiq/components/core';
import { KbqPopoverModule, KbqPopoverTrigger } from '@koobiq/components/popover';
import { fromEvent } from 'rxjs';
import { take } from 'rxjs/operators';
import { KbqTimeRangeEditor } from './time-range-editor';
import { KbqTimeRangeEditorBridge } from './time-range-editor-bridge';
import { KbqTimeRangeTitle } from './time-range-title';
import { KbqTimeRangeService } from './time-range.service';
import {
    KbqRangeValue,
    KbqTimeRangeCustomizableTitleContext,
    KbqTimeRangeOptionContext,
    KbqTimeRangeRange,
    KbqTimeRangeType
} from './types';

/** Localization configuration provider. */
export const KBQ_TIME_RANGE_LOCALE_CONFIGURATION = new InjectionToken<KbqTimeRangeLocaleConfiguration>(
    'KbqTimeRangeLocaleConfiguration',
    { factory: () => ruRULocaleData.timeRange }
);

/**
 * Utility provider for `KBQ_TIME_RANGE_LOCALE_CONFIGURATION`. Only the strings you pass are overridden;
 * the rest keep following the active locale.
 */
export const kbqTimeRangeLocaleConfigurationProvider = (
    configuration: KbqDeepPartial<KbqTimeRangeLocaleConfiguration>
): Provider => kbqLocaleConfigurationOverrideProvider('timeRange', configuration);

@Component({
    selector: 'kbq-time-range',
    imports: [
        ReactiveFormsModule,
        KbqPopoverModule,
        KbqButtonModule,
        KbqTimeRangeEditor,
        KbqTimeRangeTitle
    ],
    template: `
        @let localeConfig = localeConfiguration();
        <kbq-time-range-title
            #popover="kbqPopover"
            class="kbq-time-range__trigger"
            kbqPopover
            kbqPopoverClass="kbq-time-range__popover"
            [kbqPopoverSize]="popoverSize"
            [kbqPopoverContent]="timeRangePopoverContent"
            [kbqPopoverFooter]="timeRangePopoverFooter"
            [kbqPopoverPlacement]="popupPlacement"
            [kbqPopoverArrow]="arrow()"
            [kbqPopoverDisabled]="disabled()"
            [titleTemplate]="titleTemplate()"
            [timeRange]="titleValue()"
            [disabled]="disabled()"
            [localeConfiguration]="localeConfig"
            (kbqPopoverVisibleChange)="onVisibleChange($event)"
        />

        <ng-template #timeRangePopoverContent>
            <kbq-time-range-editor
                [maxDate]="maxDate()"
                [minDate]="minDate()"
                [formControl]="rangeEditorControl"
                [localeConfiguration]="localeConfig"
                [showRangeAsDefault]="showRangeAsDefault()"
                [rangeValue]="normalizedDefaultRangeValue()"
                [availableTimeRangeTypes]="availableTimeRangeTypes()"
                [optionTemplate]="optionTemplate()"
            />
        </ng-template>

        <ng-template #timeRangePopoverFooter>
            <!-- The grouping is purely visual: an unnamed role=group only added a boundary. -->
            <div class="kbq-time-range__buttons" (mousedown)="onFooterPointerDown()">
                <button kbq-button [color]="'contrast'" (click)="onApply(popover)">
                    {{ localeConfig.editor.apply }}
                </button>

                <button kbq-button (click)="onCancel(popover)">{{ localeConfig.editor.cancel }}</button>
            </div>
        </ng-template>
    `,
    styleUrls: ['./time-range.scss'],
    providers: [KbqTimeRangeService, KbqTimeRangeEditorBridge],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-time-range',
        '[class.kbq-disabled]': 'disabled()'
    },
    hostDirectives: [
        { directive: KbqLocaleOverridesDirective, inputs: ['kbqLocaleOverrides: localeOverrides'] }
    ]
})
export class KbqTimeRange<T> implements ControlValueAccessor, OnInit {
    private readonly timeRangeService = inject<KbqTimeRangeService<T>>(KbqTimeRangeService);
    private readonly editorBridge = inject(KbqTimeRangeEditorBridge);
    private readonly document = inject(DOCUMENT);
    private readonly destroyRef = inject(DestroyRef);
    /** @docs-private */
    readonly ngControl = inject(NgControl, { optional: true, self: true });

    /** The earliest date the calendars offer and the validation accepts. */
    readonly minDate = input<T>();
    /** The latest date the calendars offer and the validation accepts. */
    readonly maxDate = input<T>();
    /** Seeds the from/to pair of the manual range. */
    readonly defaultRangeValue = input<KbqRangeValue<T>>();
    /** The options the editor offers, in order. The first one is selected by default. */
    readonly availableTimeRangeTypes = input<KbqTimeRangeType[]>(this.timeRangeService.providedDefaultTimeRangeTypes);
    /** Replaces the built-in trigger. */
    readonly titleTemplate = input<TemplateRef<KbqTimeRangeCustomizableTitleContext>>();
    /** Replaces the built-in rendering of an option in the editor. */
    readonly optionTemplate = input<TemplateRef<KbqTimeRangeOptionContext>>();
    /** Whether the popover is drawn with an arrow. */
    readonly arrow = input(true, { transform: booleanAttribute });
    /**
     * Keeps the manual range visible even when `range` is not in the list of options.
     * @see availableTimeRangeTypes
     */
    readonly showRangeAsDefault = input(true);
    /** Falls back to a default value instead of holding `null`. */
    readonly nonNullable = input(true, { transform: booleanAttribute });

    /** Emits the corrected value when the provided one could not be used as is. */
    readonly valueCorrected = output<KbqTimeRangeRange>();

    /**
     * Used to calculate time range.
     * @docs-private */
    protected readonly normalizedDefaultRangeValue = computed(() => ({
        ...this.timeRangeService.getDefaultRangeValue(),
        ...this.defaultRangeValue()
    }));

    /** @docs-private */
    protected readonly titleValue: WritableSignal<KbqTimeRangeRange | null>;
    /** @docs-private */
    protected readonly rangeEditorControl: FormControl<KbqTimeRangeRange>;

    private readonly disabledState = signal(false);

    /**
     * The applied time range, or `null` when the component is nullable and holds no value.
     *
     * This is what the trigger renders, so it lags the editor until Apply.
     */
    readonly value: Signal<KbqTimeRangeRange | null> = computed(() => this.titleValue());

    /** Whether the control is disabled through the forms layer. */
    readonly disabled: Signal<boolean> = this.disabledState.asReadonly();

    /** @docs-private */
    protected readonly popoverSize = PopUpSizes.Medium;
    /** @docs-private */
    protected readonly popupPlacement = PopUpPlacements.BottomLeft;

    /** @docs-private */
    protected readonly localeConfiguration = inject(KbqLocaleOverridesDirective, { self: true }).read(
        'timeRange',
        KBQ_TIME_RANGE_LOCALE_CONFIGURATION
    );

    constructor() {
        if (this.ngControl) {
            this.ngControl.valueAccessor = this;
        }

        this.timeRangeService.bindBounds(this.minDate, this.maxDate);

        const defaultValue = this.timeRangeService.getTimeRangeDefaultValue(
            this.normalizedDefaultRangeValue(),
            this.availableTimeRangeTypes()
        );

        this.titleValue = signal(this.nonNullable() ? defaultValue : null);
        this.rangeEditorControl = new FormControl<KbqTimeRangeRange>(defaultValue, { nonNullable: true });

        toObservable(this.availableTimeRangeTypes)
            .pipe(takeUntilDestroyed())
            .subscribe(this.handleAvailableTypesChange);
    }

    ngOnInit(): void {
        // call again on init, so input signals values will be correct
        this.writeValue(this.ngControl?.value ?? null);
    }

    /** Implemented as part of ControlValueAccessor */
    writeValue(value: KbqTimeRangeRange | null): void {
        // Untracked, as `setDisabledState()`: a form control set from a consumer's `effect()` writes here on the
        // spot, and the inputs read on the way — and the editor's bounds, through its validators — would make the
        // effect run again.
        untracked(() => this.applyValue(value));
    }

    /** Body of `writeValue()`. */
    private applyValue(value: KbqTimeRangeRange | null): void {
        const nonNullable = this.nonNullable();

        const availableTimeRangeTypes = this.availableTimeRangeTypes();

        const corrected = this.timeRangeService.checkAndCorrectTimeRangeValue(
            value,
            availableTimeRangeTypes,
            this.normalizedDefaultRangeValue()
        );

        if (this.wasCorrected(value, corrected)) {
            this.valueCorrected.emit(corrected);
        }

        this.titleValue.set(nonNullable || value !== null ? corrected : null);
        this.rangeEditorControl.setValue(corrected);
    }

    /**
     * Lets the editor tell an "apply" gesture from a plain focus loss before the click even lands - the
     * `focusout` it reacts to is dispatched between this `mousedown` and the `click` below.
     * @docs-private
     */
    protected onFooterPointerDown(): void {
        this.editorBridge.applyGestureInProgress = true;

        fromEvent(this.document, 'mouseup')
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => (this.editorBridge.applyGestureInProgress = false));
    }

    /**
     * Whether the correction pass produced a different range than the one written.
     *
     * Comparing the outcome rather than the shape of the input keeps presets that legitimately carry
     * no `startDateTime` - `allTime` resolves to `{}` unless a consumer supplies a range - from
     * reporting a correction that never happened, and looping any host that writes the payload back.
     */
    private wasCorrected(value: KbqTimeRangeRange | null, corrected: KbqTimeRangeRange): boolean {
        if (value === null) return this.nonNullable();

        return (
            value.type !== corrected.type ||
            value.startDateTime !== corrected.startDateTime ||
            value.endDateTime !== corrected.endDateTime
        );
    }

    /**
     * Applying is always offered; an invalid editor keeps the popover open and sends the user to the
     * first field at fault instead.
     * @docs-private
     */
    onApply(popover: KbqPopoverTrigger): void {
        this.editorBridge.applyGestureInProgress = false;

        if (!this.editorBridge.revealErrors()) return;

        this.titleValue.set(this.rangeEditorControl.value);
        this.onChange(this.rangeEditorControl.value);
        popover.hide();
    }

    /** @docs-private */
    onCancel(popover: KbqPopoverTrigger): void {
        this.editorBridge.applyGestureInProgress = false;
        popover.hide();
    }

    onVisibleChange(isVisible: boolean) {
        if (isVisible) return;

        // A pointer held on the footer when the popover went away - a release outside the window, say -
        // would otherwise leave the gesture marked as in flight, and the next focusout out of the range
        // would be read as an apply and skip the swap.
        this.editorBridge.applyGestureInProgress = false;

        // Closing throws the edits away, applied or not. With nothing on the trigger yet there is no value
        // to go back to, so the editor returns to its default - otherwise an abandoned edit, which may well
        // be one the editor refused to apply, would be waiting the next time it opens.
        this.rangeEditorControl.setValue(this.titleValue() ?? this.defaultEditorValue(this.availableTimeRangeTypes()));

        // Closing the popover is the point the user is done with the control, whether they applied
        // or cancelled - every ErrorStateMatcher in the library keys error display off `touched`.
        this.onTouch();
    }

    /** @docs-private */
    onChange = (_value: KbqTimeRangeRange) => {};
    /** @docs-private */
    onTouch = () => {};
    /** Implemented as part of ControlValueAccessor */
    registerOnChange(fn: (_value: KbqTimeRangeRange) => void): void {
        this.onChange = fn;
    }
    /** Implemented as part of ControlValueAccessor */
    registerOnTouched(fn: () => void): void {
        this.onTouch = fn;
    }

    /** What the editor opens on: the first offered type, or a plain range when none are offered. */
    private defaultEditorValue(types: KbqTimeRangeType[]): KbqTimeRangeRange {
        return this.timeRangeService.getTimeRangeDefaultValue(
            this.normalizedDefaultRangeValue(),
            types.length ? types : ['range']
        );
    }

    /** Implemented as part of ControlValueAccessor */
    setDisabledState(isDisabled: boolean): void {
        this.disabledState.set(isDisabled);

        untracked(() => {
            if (isDisabled) {
                this.rangeEditorControl.disable({ emitEvent: false });
            } else {
                this.rangeEditorControl.enable({ emitEvent: false });
            }
        });
    }

    private handleAvailableTypesChange = (types: KbqTimeRangeType[]): void => {
        if (types.includes(this.rangeEditorControl.value.type) || this.rangeEditorControl.value.type === 'range') {
            return;
        }

        const timeRangeDefaultValue = this.defaultEditorValue(types);

        // The editor still needs something to open on, whether or not the trigger shows a value.
        this.rangeEditorControl.setValue(timeRangeDefaultValue);

        // A nullable trigger that has never been given a value keeps its placeholder: replacing the types
        // is not the user picking a range, and emitting here would put one into the bound control.
        if (!this.nonNullable() && this.titleValue() === null) return;

        this.titleValue.set(timeRangeDefaultValue);
        this.onChange(timeRangeDefaultValue);
    };
}
