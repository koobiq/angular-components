import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * @title Horizontal form
 */
@Component({
    standalone: true,
    selector: 'horizontal-form-example',
    templateUrl: 'horizontal-form-example.html',
    imports: [
        FormsModule,
        KbqFormsModule,
        KbqFormFieldModule,
        KbqInputModule
    ]
})
export class HorizontalFormExample {
    value: any;
}
