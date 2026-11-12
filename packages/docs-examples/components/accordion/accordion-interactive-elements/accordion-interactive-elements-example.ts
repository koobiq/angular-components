import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqAccordionModule } from '@koobiq/components/accordion';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

type ExampleSection = {
    id: string;
    title: string;
    enabled: boolean;
    name: string;
};

/**
 * @title Accordion interactive elements
 */
@Component({
    selector: 'accordion-interactive-elements-example',
    imports: [
        KbqAccordionModule,
        KbqButtonModule,
        KbqCheckboxModule,
        KbqDropdownModule,
        KbqFormFieldModule,
        KbqIconModule,
        KbqInputModule,
        FormsModule
    ],
    templateUrl: 'accordion-interactive-elements-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccordionInteractiveElementsExample extends BaseLocalizedExample<ExampleText> {
    protected readonly sections = computed<ExampleSection[]>(() => [
        { id: 'section-1', title: this.text().profile, enabled: true, name: '' },
        { id: 'section-2', title: this.text().specifications, enabled: false, name: '' },
        { id: 'section-3', title: this.text().servers, enabled: false, name: '' }
    ]);

    constructor() {
        super(TEXT);
    }
}
