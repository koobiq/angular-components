import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAccordionModule } from '@koobiq/components/accordion';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Accordion sections
 */
@Component({
    selector: 'accordion-sections-example',
    imports: [KbqAccordionModule, KbqButtonToggleModule],
    templateUrl: 'accordion-sections-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccordionSectionsExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
}
