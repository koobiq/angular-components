import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqAccordionModule } from '@koobiq/components/accordion';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';

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
    protected readonly sections: ExampleSection[] = [
        { id: 'section-1', title: 'Profile', enabled: true, name: '' },
        { id: 'section-2', title: 'Specifications', enabled: false, name: '' },
        { id: 'section-3', title: 'Servers', enabled: false, name: '' }
    ];
}
