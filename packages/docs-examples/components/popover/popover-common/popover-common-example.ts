import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqPopoverModule } from '@koobiq/components/popover';

/**
 * @title Popover common
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'popover-common-example',
    imports: [KbqPopoverModule, KbqButtonModule, KbqFormFieldModule, KbqInputModule],
    styles: `
        ::ng-deep .kbq-popover.kbq-popover_medium.popover-common-example {
            width: 400px;
        }
    `,
    template: `
        <ng-template #customContent>
            <div class="layout-margin-bottom-s">Интересно, что это такое?</div>
            <kbq-form-field>
                <input kbqInput placeholder="Интересная мысль" />
            </kbq-form-field>
        </ng-template>

        <ng-template #customFooter>
            <div class="layout-row layout-wrap" style="gap: 16px">
                <button [color]="'contrast'" (click)="kbqPopover.hide(0)" kbq-button>Сохранить</button>
                <button (click)="kbqPopover.hide(0)" kbq-button>Отмена</button>
            </div>
        </ng-template>

        <button
            #kbqPopover="kbqPopover"
            [kbqPopoverClass]="'popover-common-example'"
            [kbqPopoverContent]="customContent"
            [kbqPopoverFooter]="customFooter"
            kbq-button
            kbqPopover
        >
            Открыть поповер
        </button>
    `
})
export class PopoverCommonExample {}
