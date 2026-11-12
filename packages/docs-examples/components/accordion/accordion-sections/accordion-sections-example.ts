import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAccordionModule } from '@koobiq/components/accordion';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Accordion sections
 */
@Component({
    selector: 'accordion-sections-example',
    imports: [KbqAccordionModule, KbqButtonToggleModule],
    templateUrl: 'accordion-sections-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccordionSectionsExample extends BaseLocalizedExample<ExampleText> {
    constructor() {
        super(TEXT);
    }
}
