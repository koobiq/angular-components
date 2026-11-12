import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Popover common
 */
@Component({
    selector: 'popover-overview-example',
    imports: [KbqPopoverModule, KbqButtonModule, KbqInputModule],
    template: `
        <ng-template #customContent>
            <div class="layout-margin-bottom-s">{{ t().wonder }}</div>
            <kbq-form-field>
                <input kbqInput [placeholder]="t().placeholder" />
            </kbq-form-field>
        </ng-template>

        <ng-template #customFooter>
            <div class="layout-row layout-wrap" style="gap: 16px">
                <button kbq-button [color]="'contrast'" (click)="kbqPopover.hide(0)">{{ t().save }}</button>
                <button kbq-button (click)="kbqPopover.hide(0)">{{ t().cancel }}</button>
            </div>
        </ng-template>

        <button
            #kbqPopover="kbqPopover"
            kbq-button
            kbqPopover
            [kbqPopoverClass]="'popover-overview-example'"
            [kbqPopoverContent]="customContent"
            [kbqPopoverFooter]="customFooter"
        >
            {{ t().open }}
        </button>
    `,
    styles: `
        ::ng-deep .kbq-popover.kbq-popover_medium.popover-overview-example {
            width: 400px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-row layout-align-center'
    }
})
export class PopoverOverviewExample extends BaseLocalizedExample<ExampleTranslation> {
    constructor() {
        super(TRANSLATIONS);
    }
}
