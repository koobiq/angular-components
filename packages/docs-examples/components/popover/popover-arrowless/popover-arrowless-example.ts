import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors, PopUpSizes } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqPopoverModule } from '@koobiq/components/popover';

/**
 * @title Popover arrowless
 */
@Component({
    selector: 'popover-arrowless-example',
    imports: [
        KbqButtonModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqPopoverModule
    ],
    template: `
        <ng-template #customContent>
            <div [style.width.px]="400">
                <div class="layout-margin-bottom-s">I wonder what this?</div>
                <kbq-form-field>
                    <input kbqInput placeholder="Interesting thought" />
                </kbq-form-field>
            </div>
        </ng-template>

        <ng-template #customFooter>
            <div class="layout-row layout-wrap layout-gap-l">
                <button color="contrast" kbq-button (click)="kbqPopover.hide(0)">Save</button>
                <button kbq-button (click)="kbqPopover.hide(0)">Cancel</button>
            </div>
        </ng-template>

        <button
            #kbqPopover="kbqPopover"
            kbq-button
            kbqPopover
            [kbqPopoverContent]="customContent"
            [kbqPopoverFooter]="customFooter"
            [kbqPopoverSize]="popoverSize"
            [kbqPopoverArrow]="false"
        >
            Open popover
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class PopoverArrowlessExample {
    colors = KbqComponentColors;
    protected readonly popoverSize = PopUpSizes.Large;
}
