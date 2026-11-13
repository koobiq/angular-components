import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAccordionModule, KbqAccordionVariant } from '@koobiq/components/accordion';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Accordion states
 */
@Component({
    selector: 'accordion-states-example',
    imports: [KbqAccordionModule, KbqButtonToggleModule],
    templateUrl: 'accordion-states-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccordionStatesExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    readonly accordionVariant: Record<'fill' | 'hug' | 'hugSpaceBetween', KbqAccordionVariant> = {
        fill: 'fill',
        hug: 'hug',
        hugSpaceBetween: 'hugSpaceBetween'
    };
}
