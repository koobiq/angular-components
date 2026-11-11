import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { PopUpSizes } from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqLink, KbqLinkSuffix } from '@koobiq/components/link';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { injectExampleText } from '../l10n';

/**
 * @title popover-small
 */
@Component({
    selector: 'popover-small-example',
    imports: [
        KbqPopoverModule,
        KbqButtonModule,
        KbqLink,
        KbqLinkSuffix,
        KbqIcon
    ],
    templateUrl: 'popover-small-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopoverSmallExample {
    protected readonly text = injectExampleText();

    popUpSizes = PopUpSizes;
}
