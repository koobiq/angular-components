import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormattersModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * @title Number-formatter
 */
@Component({
    standalone: true,
    selector: 'number-formatter-overview-example',
    templateUrl: 'number-formatter-overview-example.html',
    imports: [
        FormsModule,
        KbqFormFieldModule,
        KbqFormattersModule,
        KbqInputModule
    ],
    styles: `
        :host {
            .light-text-secondary {
                color: #ccc;
            }

            .row-border {
                padding: 8px;
                border-bottom: 1px solid #ccc;
            }
        }
    `
})
export class NumberFormatterOverviewExample {
    value = 1000.123;
}
