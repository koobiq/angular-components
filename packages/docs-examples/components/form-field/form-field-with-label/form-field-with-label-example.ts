import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqToggleModule } from '@koobiq/components/toggle';

/** @title Form field with kbq-label */
@Component({
    selector: 'form-field-with-label-example',
    imports: [FormsModule, KbqInputModule, KbqToggleModule],
    template: `
        <kbq-toggle class="layout-margin-bottom-m" [(ngModel)]="showRequiredMarker">Show required marker</kbq-toggle>

        <kbq-form-field [showRequiredMarker]="showRequiredMarker()">
            <kbq-label>Label</kbq-label>
            <input kbqInput required placeholder="Click on the label for auto focus" />
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldWithLabelExample {
    protected readonly showRequiredMarker = signal(false);
}
