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
import { KBQ_DEFAULT_TIME_RANGE_TYPES } from './constants';
import { KbqTimeRangeEditor } from './time-range-editor';
import { KbqTimeRangeTitle } from './time-range-title';
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
            [kbqPopoverSize]="PopUpSizes.Large"
            [kbqPopoverContent]="timeRangePopoverContent"
            [kbqPopoverFooter]="timeRangePopoverFooter"
            [kbqPopoverPlacement]="popupPlacement"
            [kbqPopoverArrow]="arrow()"
            (kbqPopoverVisibleChange)="onVisibleChange($event)"
        >
            <kbq-time-range-title />
        </div>

        <ng-template #timeRangePopoverContent>
            <div class="kbq-time-range__content" style="padding: 1px">
                <kbq-time-range-editor />
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
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqTimeRange<T> {
    readonly minDate = input();
    readonly maxDate = input();
    readonly defaultRangeValue = input<KbqRangeValue<T>>();
    readonly availableTimeRangeTypes = input<any[]>();
    readonly titleTemplate = input<TemplateRef<any>>();
    readonly arrow = input(false, { transform: booleanAttribute });

    /** @docs-private */
    protected readonly resolvedAvailableTimeRangeTypes = computed(
        () => this.availableTimeRangeTypes() || this.defaultTimeRangeTypes
    );
    /** @docs-private */
    protected readonly normalizedDefaultRangeValue = computed(() => ({
        ...this.getDefaultRangeValue(),
        ...this.defaultRangeValue()
    }));

    /** @docs-private */
    protected readonly providedDefaultTimeRangeTypes = inject(KBQ_DEFAULT_TIME_RANGE_TYPES, { optional: true });

    protected readonly PopUpSizes = PopUpSizes;
    protected readonly popupPlacement = PopUpPlacements.BottomLeft;

    private defaultTimeRangeTypes: any[] | undefined;
    private getDefaultRangeValue() {
        return [];
    }

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
