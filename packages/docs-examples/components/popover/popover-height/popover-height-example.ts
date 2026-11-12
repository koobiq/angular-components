import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqPopoverModule, KbqPopoverTrigger } from '@koobiq/components/popover';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Popover height
 */
@Component({
    selector: 'popover-height-example',
    imports: [KbqInputModule, KbqButtonModule, KbqPopoverModule, KbqFormsModule],
    templateUrl: 'popover-height-example.html',
    styles: `
        ::ng-deep .kbq-popover.popover-height-custom-example .kbq-popover__container {
            max-height: 240px;
        }

        ::ng-deep .kbq-popover.popover-height-custom-example .kbq-popover__header {
            flex-shrink: 0;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopoverHeightExample extends BaseLocalizedExample<ExampleText> {
    activePopover: KbqPopoverTrigger;

    constructor() {
        super(TEXT);
    }
}
