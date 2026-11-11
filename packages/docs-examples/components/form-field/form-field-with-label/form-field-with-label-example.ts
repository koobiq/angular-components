import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { injectExampleText } from './l10n';

/** @title Form field with kbq-label */
@Component({
    selector: 'form-field-with-label-example',
    imports: [FormsModule, KbqInputModule, KbqToggleModule],
    template: `
        <kbq-toggle class="layout-margin-bottom-m" [(ngModel)]="showRequiredMarker">Show required marker</kbq-toggle>

        <kbq-form-field [showRequiredMarker]="showRequiredMarker()">
            <kbq-label>{{ text().label }}</kbq-label>
            <input kbqInput required [placeholder]="text().clickLabelForFocus" />
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldWithLabelExample {
    protected readonly text = injectExampleText();

    protected readonly showRequiredMarker = signal(false);
}
