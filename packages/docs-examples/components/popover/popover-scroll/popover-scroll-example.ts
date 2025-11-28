import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqPopoverModule, KbqPopoverTrigger } from '@koobiq/components/popover';

/**
 * @title popover-scroll
 */
@Component({
    selector: 'popover-scroll-example',
    imports: [
        KbqButtonModule,
        KbqPopoverModule,
        KbqFormFieldModule,
        KbqInputModule
    ],
    template: `
        <ng-template #customContent>
            <div class="layout-margin-bottom-s">Интересно, что это такое?</div>
            <kbq-form-field>
                <input kbqInput placeholder="Интересная мысль" />
            </kbq-form-field>
        </ng-template>

        <ng-template #customFooter>
            <div class="layout-row layout-wrap" style="gap: 16px">
                <button kbq-button [color]="'contrast'" (click)="activePopover.hide(0)">Сохранить</button>
                <button kbq-button (click)="activePopover.hide(0)">Отмена</button>
            </div>
        </ng-template>

        <div class="layout-row layout-wrap" style="gap: 16px">
            <button
                #kbqNoClosePopover="kbqPopover"
                kbq-button
                kbqPopover
                [kbqPopoverClass]="'popover-scroll-example'"
                [kbqPopoverContent]="customContent"
                [kbqPopoverFooter]="customFooter"
                (click)="activePopover = kbqNoClosePopover"
            >
                Поповер не закрывается при прокрутке
            </button>
            <button
                #kbqClosePopover="kbqPopover"
                kbq-button
                kbqPopover
                [closeOnScroll]="true"
                [kbqPopoverClass]="'popover-scroll-example'"
                [kbqPopoverContent]="customContent"
                [kbqPopoverFooter]="customFooter"
                (click)="activePopover = kbqClosePopover"
            >
                Закрывается при прокрутке
            </button>
        </div>
    `,
    styles: `
        ::ng-deep .kbq-popover.kbq-popover_medium.popover-scroll-example {
            width: 400px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopoverScrollExample {
    activePopover: KbqPopoverTrigger;
}
