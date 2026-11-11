import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqPopoverModule, KbqPopoverTrigger } from '@koobiq/components/popover';
import { injectExampleText } from './l10n';

/**
 * @title popover-scroll
 */
@Component({
    selector: 'popover-scroll-example',
    imports: [
        KbqButtonModule,
        KbqPopoverModule,
        KbqInputModule
    ],
    template: `
        <ng-template #customContent>
            <div class="layout-margin-bottom-s">{{ text().wonder }}</div>
            <kbq-form-field>
                <input kbqInput [placeholder]="text().placeholder" />
            </kbq-form-field>
        </ng-template>

        <ng-template #customFooter>
            <div class="layout-row layout-wrap" style="gap: 16px">
                <button kbq-button [color]="'contrast'" (click)="activePopover.hide(0)">{{ text().save }}</button>
                <button kbq-button (click)="activePopover.hide(0)">{{ text().cancel }}</button>
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
                {{ text().noCloseOnScroll }}
            </button>
            <button
                #kbqClosePopover="kbqPopover"
                kbq-button
                kbqPopover
                [kbqPopoverCloseOnScroll]="true"
                [kbqPopoverClass]="'popover-scroll-example'"
                [kbqPopoverContent]="customContent"
                [kbqPopoverFooter]="customFooter"
                (click)="activePopover = kbqClosePopover"
            >
                {{ text().closeOnScroll }}
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
    protected readonly text = injectExampleText();

    activePopover: KbqPopoverTrigger;
}
