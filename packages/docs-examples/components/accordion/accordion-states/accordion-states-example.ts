import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAccordionModule, KbqAccordionVariant } from '@koobiq/components/accordion';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { injectExampleText } from '../l10n';

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
    protected readonly text = injectExampleText();

    readonly accordionVariant: Record<'fill' | 'hug' | 'hugSpaceBetween', KbqAccordionVariant> = {
        fill: 'fill',
        hug: 'hug',
        hugSpaceBetween: 'hugSpaceBetween'
    };
}
