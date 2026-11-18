import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAccordionModule } from '@koobiq/components/accordion';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Accordion content
 */
@Component({
    selector: 'accordion-content-example',
    imports: [KbqAccordionModule, KbqCheckboxModule],
    templateUrl: 'accordion-content-example.html',
    styleUrls: ['accordion-content-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccordionContentExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    image: boolean = false;
}
