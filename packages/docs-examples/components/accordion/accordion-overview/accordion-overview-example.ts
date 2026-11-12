import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAccordionModule } from '@koobiq/components/accordion';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Accordion
 */
@Component({
    selector: 'accordion-overview-example',
    imports: [KbqAccordionModule],
    templateUrl: 'accordion-overview-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccordionOverviewExample extends BaseLocalizedExample<ExampleTranslation> {
    constructor() {
        super(TRANSLATIONS);
    }
}
