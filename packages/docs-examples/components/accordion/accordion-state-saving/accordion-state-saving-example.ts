import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAccordionModule } from '@koobiq/components/accordion';
import { KbqButtonModule } from '@koobiq/components/button';
import { injectExampleText } from './l10n';

/**
 * @title Accordion state saving
 */
@Component({
    selector: 'accordion-state-saving-example',
    imports: [KbqAccordionModule, KbqButtonModule],
    templateUrl: 'accordion-state-saving-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccordionStateSavingExample {
    protected readonly text = injectExampleText();
}
