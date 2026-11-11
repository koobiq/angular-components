import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqListModule } from '@koobiq/components/list';
import { injectExampleText } from '../l10n';

/**
 * @title List multiple checkbox
 */
@Component({
    selector: 'list-multiple-checkbox-example',
    imports: [KbqListModule, FormsModule],
    template: `
        <kbq-list-selection multiple="checkbox" [attr.aria-label]="text().items" [(ngModel)]="selected">
            <kbq-list-option [disabled]="true" [value]="text().item(1)">{{ text().item(1) }}</kbq-list-option>
            <kbq-list-option [value]="text().item(2)">{{ text().item(2) }}</kbq-list-option>
            <kbq-list-option [value]="text().item(3)">{{ text().item(3) }}</kbq-list-option>
            <kbq-list-option [value]="text().item(4)">{{ text().item(4) }}</kbq-list-option>
            <kbq-list-option [value]="text().item(5)">{{ text().item(5) }}</kbq-list-option>
            <kbq-list-option [value]="text().item(6)">{{ text().item(6) }}</kbq-list-option>
            <kbq-list-option [value]="text().item(7)">{{ text().item(7) }}</kbq-list-option>
            <kbq-list-option [value]="text().item(8)">{{ text().item(8) }}</kbq-list-option>
            <kbq-list-option [value]="text().item(9)">{{ text().item(9) }}</kbq-list-option>
            <kbq-list-option [value]="text().item(10)">{{ text().item(10) }}</kbq-list-option>
        </kbq-list-selection>
        <br />
        <div>{{ text().selected }} {{ selected }}</div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListMultipleCheckboxExample {
    protected readonly text = injectExampleText();

    selected = [];
}
