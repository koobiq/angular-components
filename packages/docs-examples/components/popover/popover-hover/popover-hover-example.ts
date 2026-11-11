import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { injectExampleText } from './l10n';

/**
 * @title Popover hover
 */
@Component({
    selector: 'popover-hover-example',
    imports: [KbqPopoverModule, KbqButtonModule, KbqInputModule],
    template: `
        <ng-template #customContent>
            <div class="layout-margin-bottom-s">{{ text().wonder }}</div>
            <kbq-form-field>
                <input kbqInput [placeholder]="text().placeholder" />
            </kbq-form-field>
        </ng-template>

        <ng-template #customFooter>
            <div class="layout-row layout-wrap" style="gap: 16px">
                <button kbq-button [color]="'contrast'" (click)="kbqPopover.hide(0)">{{ text().save }}</button>
                <button kbq-button (click)="kbqPopover.hide(0)">{{ text().cancel }}</button>
            </div>
        </ng-template>

        <button
            #kbqPopover="kbqPopover"
            kbq-button
            kbqPopover
            [kbqPopoverClass]="'popover-overview-example'"
            [kbqPopoverContent]="customContent"
            [kbqPopoverFooter]="customFooter"
            [kbqTrigger]="'hover'"
        >
            {{ text().open }}
        </button>
    `,
    styles: `
        ::ng-deep .kbq-popover.kbq-popover_medium.popover-overview-example {
            width: 400px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopoverHoverExample {
    protected readonly text = injectExampleText();
}
