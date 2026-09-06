import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    InjectionToken,
    input,
    OnInit,
    output,
    Provider,
    Signal,
    signal,
    TemplateRef,
    ViewEncapsulation,
    WritableSignal
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormControl, NgControl, ReactiveFormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    KbqDeepPartial,
    kbqInjectLocaleConfiguration,
    kbqLocaleConfigurationOverrideProvider,
    KbqTimeRangeLocaleConfiguration,
    PopUpPlacements,
    PopUpSizes,
    ruRULocaleData
} from '@koobiq/components/core';
import { KbqPopoverModule, KbqPopoverTrigger } from '@koobiq/components/popover';
import { KbqTimeRangeEditor } from './time-range-editor';
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
    'KBQ_TIME_RANGE_LOCALE_CONFIGURATION',
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
            <div class="kbq-time-range__buttons">
                <button
                    kbq-button
                    [color]="'contrast'"
                    [disabled]="rangeEditorControl.invalid"
                    (click)="onApply(popover)"
                >
                    {{ localeConfig.editor.apply }}
                </button>

                <button kbq-button (click)="onCancel(popover)">{{ localeConfig.editor.cancel }}</button>
            </div>
        </ng-template>
    `,
    styleUrls: ['./time-range.scss'],
    providers: [KbqTimeRangeService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-time-range',
        '[class.kbq-disabled]': 'disabled()'
    }
})
export class KbqTimeRange<T> implements ControlValueAccessor, OnInit {
    private readonly timeRangeService = inject<KbqTimeRangeService<T>>(KbqTimeRangeService);
    /** @docs-private */
    readonly ngControl = inject(NgControl, { optional: true, self: true });

    /** The minimum selectable date. */
    readonly minDate = input<T>();
    /** The maximum selectable date. */
    readonly maxDate = input<T>();
    /** provided value of selected range */
    readonly defaultRangeValue = input<KbqRangeValue<T>>();
    /** Preset of selectable ranges */
    readonly availableTimeRangeTypes = input<KbqTimeRangeType[]>(this.timeRangeService.providedDefaultTimeRangeTypes);
    /** Customizable trigger output */
    readonly titleTemplate = input<TemplateRef<KbqTimeRangeCustomizableTitleContext>>();
    /** Customizable option output */
    readonly optionTemplate = input<TemplateRef<KbqTimeRangeOptionContext>>();
    /** Whether to show popover with arrow */
    readonly arrow = input(true, { transform: booleanAttribute });
    /**
     * Whether to show range in popover if not provided
     * @see availableTimeRangeTypes
     */
    readonly showRangeAsDefault = input(true);
    /** Whether component should fallback to default value if null provided */
    readonly nonNullable = input(true, { transform: booleanAttribute });

    /** Emit value update if provided value via formControl wasn't valid */
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
    protected readonly localeConfiguration = kbqInjectLocaleConfiguration(
        'timeRange',
        KBQ_TIME_RANGE_LOCALE_CONFIGURATION
    );

    constructor() {
        if (this.ngControl) {
            this.ngControl.valueAccessor = this;
        }

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

    /** @docs-private */
    onApply(popover: KbqPopoverTrigger): void {
        this.titleValue.set(this.rangeEditorControl.value);
        this.onChange(this.rangeEditorControl.value);
        popover.hide();
    }

    /** @docs-private */
    onCancel(popover: KbqPopoverTrigger): void {
        popover.hide();
    }

    onVisibleChange(isVisible: boolean) {
        if (isVisible) return;

        const titleValue = this.titleValue();

        if (titleValue) {
            this.rangeEditorControl.setValue(titleValue);
        }

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

    /** Implemented as part of ControlValueAccessor */
    setDisabledState(isDisabled: boolean): void {
        this.disabledState.set(isDisabled);

        if (isDisabled) {
            this.rangeEditorControl.disable({ emitEvent: false });
        } else {
            this.rangeEditorControl.enable({ emitEvent: false });
        }
    }

    private handleAvailableTypesChange = (types: KbqTimeRangeType[]): void => {
        if (types.includes(this.rangeEditorControl.value.type) || this.rangeEditorControl.value.type === 'range') {
            return;
        }

        const timeRangeDefaultValue = this.timeRangeService.getTimeRangeDefaultValue(
            this.normalizedDefaultRangeValue(),
            types.length ? types : ['range']
        );

        this.titleValue.set(timeRangeDefaultValue);
        this.rangeEditorControl.setValue(timeRangeDefaultValue);
        this.onChange(timeRangeDefaultValue);
    };
}
