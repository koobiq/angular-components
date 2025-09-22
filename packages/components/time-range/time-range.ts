import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    TemplateRef,
    ViewEncapsulation
} from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { PopUpPlacements, PopUpSizes } from '@koobiq/components/core';
import { KbqPopoverModule, KbqPopoverTrigger } from '@koobiq/components/popover';
import { KbqTimeRangeEditor } from './time-range-editor';
import { KbqTimeRangeTitle } from './time-range-title';
import { KbqTimeRangeService } from './time-range.service';
import { KbqRangeValue } from './types';

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
            <kbq-time-range-title [titleTemplate]="titleTemplate()" />
        </div>

        <ng-template #timeRangePopoverContent>
            <div class="kbq-time-range__content">
                <kbq-time-range-editor [maxDate]="maxDate()" [minDate]="minDate()" />
            </div>
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
export class KbqTimeRange<T> {
    private readonly timeRangeService = inject(KbqTimeRangeService);

    readonly minDate = input<T>();
    readonly maxDate = input<T>();
    /** provided value of selected range */
    readonly defaultRangeValue = input<Partial<KbqRangeValue<T>>>();
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

    // @TODO:

    onVisibleChange(isVisible: boolean): void {
        if (!isVisible) {
            console.log(isVisible);
        }
    }

    onApply(popover: KbqPopoverTrigger): void {
        popover.hide();
    }

    onCancel(popover: KbqPopoverTrigger): void {
        popover.hide();
    }
}
