import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/** @title Form field with kbq-label */
@Component({
    selector: 'form-field-with-label-example',
    imports: [FormsModule, KbqInputModule, KbqToggleModule],
    template: `
        <kbq-toggle class="layout-margin-bottom-m" [(ngModel)]="showRequiredMarker">Show required marker</kbq-toggle>

        <kbq-form-field [showRequiredMarker]="showRequiredMarker()">
            <kbq-label>{{ t().label }}</kbq-label>
            <input kbqInput required [placeholder]="t().clickLabelForFocus" />
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldWithLabelExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    protected readonly showRequiredMarker = signal(false);
}
