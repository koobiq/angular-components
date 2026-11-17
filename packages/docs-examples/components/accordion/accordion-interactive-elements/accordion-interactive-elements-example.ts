import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqAccordionModule } from '@koobiq/components/accordion';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

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
export class AccordionInteractiveElementsExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    protected readonly sections = computed<ExampleSection[]>(() => [
        { id: 'section-1', title: this.t().profile, enabled: true, name: '' },
        { id: 'section-2', title: this.t().specifications, enabled: false, name: '' },
        { id: 'section-3', title: this.t().servers, enabled: false, name: '' }
    ]);
}
