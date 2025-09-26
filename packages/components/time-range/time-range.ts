import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    InjectionToken,
    input,
    Provider,
    signal,
    TemplateRef,
    ViewEncapsulation,
    WritableSignal
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    KBQ_LOCALE_SERVICE,
    KbqTimeRangeLocaleConfig,
    PopUpPlacements,
    PopUpSizes,
    ruRULocaleData
} from '@koobiq/components/core';
import { KbqPopoverModule, KbqPopoverTrigger } from '@koobiq/components/popover';
import { KbqTimeRangeEditor } from './time-range-editor';
import { KbqTimeRangeTitle } from './time-range-title';
import { KbqTimeRangeService } from './time-range.service';
import { KbqRangeValue, KbqTimeRangeCustomizableTitleContext, KbqTimeRangeRange, KbqTimeRangeType } from './types';

/** Localization configuration provider. */
export const KBQ_TIME_RANGE_LOCALE_CONFIGURATION = new InjectionToken<KbqTimeRangeLocaleConfig>(
    'KBQ_TIME_RANGE_LOCALE_CONFIGURATION',
    { factory: () => ruRULocaleData.timeRange }
);

/** Utility provider for `KBQ_TIME_RANGE_LOCALE_CONFIGURATION`. */
export const kbqTimeRangeLocaleConfigurationProvider = (
    configuration: Partial<KbqTimeRangeLocaleConfig>
): Provider => ({
    provide: KBQ_TIME_RANGE_LOCALE_CONFIGURATION,
    useValue: { ...ruRULocaleData.timeRange, ...configuration }
});

@Component({
    standalone: true,
    selector: 'kbq-time-range',
    template: `
        @let localeConfig = localeConfiguration();
        <div
            #popover="kbqPopover"
            class="kbq-time-range__trigger"
            kbqPopover
            kbqPopoverClass="kbq-time-range__popover"
            [kbqPopoverSize]="popoverSize"
            [kbqPopoverContent]="timeRangePopoverContent"
            [kbqPopoverFooter]="timeRangePopoverFooter"
            [kbqPopoverPlacement]="popupPlacement"
            [kbqPopoverArrow]="arrow()"
            (kbqPopoverVisibleChange)="onVisibleChange($event)"
        >
            <kbq-time-range-title
                [titleTemplate]="titleTemplate()"
                [timeRange]="titleValue()"
                [localeConfiguration]="localeConfig"
            />
        </div>

        <ng-template #timeRangePopoverContent>
            <kbq-time-range-editor
                [maxDate]="maxDate()"
                [minDate]="minDate()"
                [formControl]="rangeEditorControl"
                [localeConfiguration]="localeConfig"
                [showRangeAsDefault]="showRangeAsDefault()"
                [rangeValue]="normalizedDefaultRangeValue()"
                [availableTimeRangeTypes]="availableTimeRangeTypes()"
            />
        </ng-template>

        <ng-template #timeRangePopoverFooter>
            <div class="kbq-time-range__buttons" role="group">
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
    imports: [
        ReactiveFormsModule,
        KbqPopoverModule,
        KbqButtonModule,
        KbqTimeRangeEditor,
        KbqTimeRangeTitle
    ],
    host: {
        class: 'kbq-time-range'
    },
    providers: [
        KbqTimeRangeService,
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: KbqTimeRange,
            multi: true
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqTimeRange<T> implements ControlValueAccessor {
    private readonly timeRangeService = inject<KbqTimeRangeService<T>>(KbqTimeRangeService);

    /** The minimum selectable date. */
    readonly minDate = input<T>();
    /** The maximum selectable date. */
    readonly maxDate = input<T>();
    /** provided value of selected range */
    readonly defaultRangeValue = input<KbqRangeValue<T>>();
    /** Preset of selectable ranges */
    readonly availableTimeRangeTypes = input<KbqTimeRangeType[]>(this.timeRangeService.resolvedTimeRangeTypes);
    /** Customizable trigger output */
    readonly titleTemplate = input<TemplateRef<KbqTimeRangeCustomizableTitleContext>>();

    /** Whether to show popover with arrow */
    readonly arrow = input(false, { transform: booleanAttribute });
    /**
     * Whether to show range in popover if not provided
     * @see availableTimeRangeTypes
     */
    readonly showRangeAsDefault = input(true);

    /**
     * Used to calculate time range.
     * @docs-private */
    protected readonly normalizedDefaultRangeValue = computed(() => ({
        ...this.timeRangeService.getDefaultRangeValue(),
        ...this.defaultRangeValue()
    }));

    /** @docs-private */
    protected titleValue: WritableSignal<KbqTimeRangeRange>;
    /** @docs-private */
    protected readonly rangeEditorControl: FormControl<KbqTimeRangeRange>;

    /** @docs-private */
    protected readonly popoverSize = PopUpSizes.Medium;
    /** @docs-private */
    protected readonly popupPlacement = PopUpPlacements.BottomLeft;

    /** @docs-private */
    localeConfiguration = signal(inject(KBQ_TIME_RANGE_LOCALE_CONFIGURATION));
    private localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });

    constructor() {
        const defaultValue = this.timeRangeService.getTimeRangeDefaultValue(this.normalizedDefaultRangeValue());

        this.titleValue = signal(defaultValue);
        this.rangeEditorControl = new FormControl<KbqTimeRangeRange>(this.titleValue(), { nonNullable: true });

        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe((id) => {
            this.timeRangeService.dateFormatter.setLocale(id);
            this.localeConfiguration.set(this.localeService?.getParams('timeRange') ?? ruRULocaleData.timeRange);
        });

        toObservable(this.availableTimeRangeTypes)
            .pipe(takeUntilDestroyed())
            .subscribe((types) => {
                this.titleValue.set(
                    this.timeRangeService.getTimeRangeDefaultValue(this.normalizedDefaultRangeValue(), types)
                );
                this.onChange(this.titleValue());
            });
    }

    /** Implemented as part of ControlValueAccessor */
    writeValue(value: KbqTimeRangeRange | undefined): void {
        const corrected = this.timeRangeService.checkAndCorrectTimeRangeValue(
            value,
            this.availableTimeRangeTypes(),
            this.normalizedDefaultRangeValue()
        );

        this.titleValue.set(corrected);
        this.rangeEditorControl.setValue(corrected);
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
        if (!isVisible) {
            this.rangeEditorControl.setValue(this.titleValue());
        }
    }

    /** Implemented as part of ControlValueAccessor
     * @docs-private */
    onChange = (_value: KbqTimeRangeRange) => {};
    /** Implemented as part of ControlValueAccessor
     * @docs-private */
    onTouch = () => {};
    /** Implemented as part of ControlValueAccessor */
    registerOnChange(fn: (_value: KbqTimeRangeRange) => void): void {
        this.onChange = fn;
    }
    /** Implemented as part of ControlValueAccessor */
    registerOnTouched(fn: () => void): void {
        this.onTouch = fn;
    }
}
