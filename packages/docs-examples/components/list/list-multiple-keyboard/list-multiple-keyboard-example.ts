import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqListModule } from '@koobiq/components/list';

/**
 * @title List multiple keyboard
 */
@Component({
    selector: 'list-multiple-keyboard-example',
    imports: [KbqListModule, FormsModule],
    template: `
        <kbq-list-selection multiple="keyboard" [(ngModel)]="selected">
            <kbq-list-option disabled [value]="'Item 1'">Item 1</kbq-list-option>
            <kbq-list-option [value]="'Item 2'">Item 2</kbq-list-option>
            <kbq-list-option [value]="'Item 3'">Item 3</kbq-list-option>
            <kbq-list-option [value]="'Item 4'">Item 4</kbq-list-option>
            <kbq-list-option [value]="'Item 5'">Item 5</kbq-list-option>
            <kbq-list-option [value]="'Item 6'">Item 6</kbq-list-option>
            <kbq-list-option [value]="'Item 7'">Item 7</kbq-list-option>
            <kbq-list-option [value]="'Item 8'">Item 8</kbq-list-option>
            <kbq-list-option [value]="'Item 9'">Item 9</kbq-list-option>
            <kbq-list-option [value]="'Item 10'">Item 10</kbq-list-option>
        </kbq-list-selection>
        <br />
        <div>Selected: {{ selected }}</div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListMultipleKeyboardExample {
    selected = [];
}
