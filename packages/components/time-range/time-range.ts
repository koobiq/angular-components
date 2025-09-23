import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    signal,
    TemplateRef,
    ViewEncapsulation,
    WritableSignal
} from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { PopUpPlacements, PopUpSizes } from '@koobiq/components/core';
import { KbqPopoverModule, KbqPopoverTrigger } from '@koobiq/components/popover';
import { KbqTimeRangeEditor } from './time-range-editor';
import { KbqTimeRangeTitle } from './time-range-title';
import { KbqTimeRangeService } from './time-range.service';
import { KbqRangeValue, KbqTimeRange as TimeRange } from './types';

@Component({
    standalone: true,
    selector: 'kbq-time-range',
    exportAs: 'kbqTimeRange',
    template: `
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
            <kbq-time-range-title [titleTemplate]="titleTemplate()" [timeRange]="titleValue()" />
        </div>

        <ng-template #timeRangePopoverContent>
            <kbq-time-range-editor [maxDate]="maxDate()" [minDate]="minDate()" [formControl]="rangeEditorControl" />
        </ng-template>

        <ng-template #timeRangePopoverFooter>
            <div class="kbq-time-range__buttons" role="group">
                <button kbq-button [color]="'contrast'" (click)="onApply(popover)">Apply</button>

                <button kbq-button (click)="onCancel(popover)">Cancel</button>
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
    private readonly timeRangeService = inject(KbqTimeRangeService);

    readonly minDate = input<T>();
    readonly maxDate = input<T>();
    /** provided value of selected range */
    readonly defaultRangeValue = input<KbqRangeValue<T>>();
    readonly availableTimeRangeTypes = input<any[]>(this.timeRangeService.resolvedTimeRangeTypes);
    readonly titleTemplate = input<TemplateRef<any>>();

    readonly arrow = input(false, { transform: booleanAttribute });

    /**
     * Used to calculate time range.
     * @docs-private */
    protected readonly normalizedDefaultRangeValue = computed(() => ({
        ...this.timeRangeService.getDefaultRangeValue(),
        ...this.defaultRangeValue()
    }));

    /** @docs-private */
    protected readonly popoverSize = PopUpSizes.Medium;
    /** @docs-private */
    protected readonly popupPlacement = PopUpPlacements.BottomLeft;

    protected titleValue: WritableSignal<TimeRange>;
    protected readonly rangeEditorControl: FormControl<TimeRange>;

    constructor() {
        const defaultValue = this.timeRangeService.getTimeRangeDefaultValue(this.normalizedDefaultRangeValue());

        this.titleValue = signal(defaultValue);
        this.rangeEditorControl = new FormControl<TimeRange>(this.titleValue(), { nonNullable: true });
    }

    /** Implemented as part of ControlValueAccessor
     * @docs-private */
    onChange = (_value: TimeRange) => {};
    /** Implemented as part of ControlValueAccessor
     * @docs-private */
    onTouch = () => {};
    /** Implemented as part of ControlValueAccessor
     * @docs-private */
    registerOnChange(fn: (_value: TimeRange) => void): void {
        this.onChange = fn;
    }
    /** Implemented as part of ControlValueAccessor
     * @docs-private */
    registerOnTouched(fn: () => void): void {
        this.onTouch = fn;
    }
    /** Implemented as part of ControlValueAccessor
     * @docs-private */
    writeValue(value: TimeRange | undefined): void {
        const corrected = this.timeRangeService.checkAndCorrectTimeRangeValue(
            value,
            this.availableTimeRangeTypes(),
            this.normalizedDefaultRangeValue()
        );

        this.titleValue.set(corrected);
        this.rangeEditorControl.setValue(corrected);
    }

    /** @docs-private */
    onVisibleChange(isVisible: boolean): void {
        if (!isVisible) {
            this.rangeEditorControl.setValue(this.titleValue());
        }
    }

    onApply(popover: KbqPopoverTrigger): void {
        this.titleValue.set(this.rangeEditorControl.value);
        this.onChange(this.rangeEditorControl.value);
        popover.hide();
    }

    onCancel(popover: KbqPopoverTrigger): void {
        popover.hide();
    }
}
