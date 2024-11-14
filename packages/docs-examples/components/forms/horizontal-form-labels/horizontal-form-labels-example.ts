import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * @title Horizontal form labels
 */
@Component({
    standalone: true,
    selector: 'horizontal-form-labels-example',
    templateUrl: 'horizontal-form-labels-example.html',
    styleUrls: ['horizontal-form-labels-example.css'],
    imports: [
        FormsModule,
        KbqFormsModule,
        KbqFormFieldModule,
        KbqInputModule
    ]
})
export class HorizontalFormLabelsExample {
    value: any;
}
