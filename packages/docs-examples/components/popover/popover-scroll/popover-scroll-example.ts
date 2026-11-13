import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqPopoverModule, KbqPopoverTrigger } from '@koobiq/components/popover';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

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
            <div class="layout-margin-bottom-s">{{ t().wonder }}</div>
            <kbq-form-field>
                <input kbqInput [placeholder]="t().placeholder" />
            </kbq-form-field>
        </ng-template>

        <ng-template #customFooter>
            <div class="layout-row layout-wrap" style="gap: 16px">
                <button kbq-button [color]="'contrast'" (click)="activePopover.hide(0)">{{ t().save }}</button>
                <button kbq-button (click)="activePopover.hide(0)">{{ t().cancel }}</button>
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
                {{ t().noCloseOnScroll }}
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
                {{ t().closeOnScroll }}
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
    protected readonly t = injectTranslation(TRANSLATIONS);

    activePopover: KbqPopoverTrigger;
}
