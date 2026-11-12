import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAccordionModule } from '@koobiq/components/accordion';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Accordion inactive section
 */
@Component({
    selector: 'accordion-inactive-section-example',
    imports: [KbqAccordionModule],
    templateUrl: 'accordion-inactive-section-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccordionInactiveSectionExample extends BaseLocalizedExample<ExampleTranslation> {
    constructor() {
        super(TRANSLATIONS);
    }
}
