import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { PopUpSizes } from '@koobiq/components/core';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Popover width
 */
@Component({
    selector: 'popover-width-example',
    imports: [
        KbqPopoverModule,
        KbqButtonModule
    ],
    templateUrl: 'popover-width-example.html',
    styles: `
        ::ng-deep .kbq-popover.popover-width-example p:first-child {
            margin-top: 0;
        }

        ::ng-deep .kbq-popover.popover-width-example p:last-child {
            margin-bottom: 0;
        }

        ::ng-deep .kbq-popover.kbq-popover_medium.popover-width-custom-example {
            max-width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopoverWidthExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    popUpSizes = PopUpSizes;
    selectedSize = PopUpSizes.Small;
}
