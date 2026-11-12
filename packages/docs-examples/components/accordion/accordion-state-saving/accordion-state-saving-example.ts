import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAccordionModule } from '@koobiq/components/accordion';
import { KbqButtonModule } from '@koobiq/components/button';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Accordion state saving
 */
@Component({
    selector: 'accordion-state-saving-example',
    imports: [KbqAccordionModule, KbqButtonModule],
    templateUrl: 'accordion-state-saving-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccordionStateSavingExample extends BaseLocalizedExample<ExampleText> {
    constructor() {
        super(TEXT);
    }
}
