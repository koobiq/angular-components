import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAccordionModule } from '@koobiq/components/accordion';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Accordion
 */
@Component({
    selector: 'accordion-overview-example',
    imports: [KbqAccordionModule],
    templateUrl: 'accordion-overview-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccordionOverviewExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
}
