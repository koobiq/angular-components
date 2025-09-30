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
import { ControlValueAccessor, FormControl, NgControl, ReactiveFormsModule } from '@angular/forms';
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
export const kbqTimeRangeLocaleConfigurationProvider = (configuration: KbqTimeRangeLocaleConfig): Provider => ({
    provide: KBQ_TIME_RANGE_LOCALE_CONFIGURATION,
    useValue: configuration
});

@Component({
    standalone: true,
    selector: 'kbq-time-range',
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
            [titleTemplate]="titleTemplate()"
            [timeRange]="titleValue()"
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
    providers: [KbqTimeRangeService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqTimeRange<T> implements ControlValueAccessor {
    private readonly timeRangeService = inject<KbqTimeRangeService<T>>(KbqTimeRangeService);
    private readonly localeService = inject(KBQ_LOCALE_SERVICE, { optional: true });
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

    /** Whether to show popover with arrow */
    readonly arrow = input(true, { transform: booleanAttribute });
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
    protected readonly localeConfiguration = signal(inject(KBQ_TIME_RANGE_LOCALE_CONFIGURATION));

    constructor() {
        if (this.ngControl) {
            this.ngControl.valueAccessor = this;
        }

        const defaultValue = this.timeRangeService.getTimeRangeDefaultValue(
            this.normalizedDefaultRangeValue(),
            this.availableTimeRangeTypes()
        );

        this.titleValue = signal(defaultValue);
        this.rangeEditorControl = new FormControl<KbqTimeRangeRange>(this.titleValue(), { nonNullable: true });

        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe(() => {
            this.localeConfiguration.set(this.localeService?.getParams('timeRange') ?? ruRULocaleData.timeRange);
        });

        toObservable(this.availableTimeRangeTypes)
            .pipe(takeUntilDestroyed())
            .subscribe(this.handleAvailableTypesChange);
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

    private handleAvailableTypesChange = (types: KbqTimeRangeType[]) => {
        if (types.includes(this.rangeEditorControl.value.type) || this.rangeEditorControl.value.type === 'range') {
            return;
        }

        this.titleValue.set(
            this.timeRangeService.getTimeRangeDefaultValue(
                this.normalizedDefaultRangeValue(),
                types.length ? types : ['range']
            )
        );
        this.rangeEditorControl.setValue(this.titleValue());
        this.onChange(this.rangeEditorControl.value);
    };
}
