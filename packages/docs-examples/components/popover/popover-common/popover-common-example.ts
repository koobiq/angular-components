import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqPopoverModule } from '@koobiq/components/popover';

/**
 * @title Popover common
 */
@Component({
    selector: 'popover-common-example',
    imports: [KbqPopoverModule, KbqButtonModule, KbqFormFieldModule, KbqInputModule],
    template: `
        <ng-template #customContent>
            <div class="layout-margin-bottom-s">Интересно, что это такое?</div>
            <kbq-form-field>
                <input kbqInput placeholder="Интересная мысль" />
            </kbq-form-field>
        </ng-template>

        <ng-template #customFooter>
            <div class="layout-row layout-wrap" style="gap: 16px">
                <button kbq-button [color]="'contrast'" (click)="kbqPopover.hide(0)">Сохранить</button>
                <button kbq-button (click)="kbqPopover.hide(0)">Отмена</button>
            </div>
        </ng-template>

        <button
            #kbqPopover="kbqPopover"
            kbq-button
            kbqPopover
            [kbqPopoverClass]="'popover-common-example'"
            [kbqPopoverContent]="customContent"
            [kbqPopoverFooter]="customFooter"
        >
            Открыть поповер
        </button>
    `,
    styles: `
        ::ng-deep .kbq-popover.kbq-popover_medium.popover-common-example {
            width: 400px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopoverCommonExample {}
