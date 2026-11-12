import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAccordionModule } from '@koobiq/components/accordion';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

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
export class AccordionContentExample extends BaseLocalizedExample<ExampleText> {
    image: boolean = false;

    constructor() {
        super(TEXT);
    }
}
