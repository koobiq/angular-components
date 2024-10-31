import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
        KbqFormFieldModule,
        KbqInputModule
    ]
})
export class HorizontalFormExample {
    value: any;
}
