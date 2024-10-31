import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * @title Vertical form
 */
@Component({
    standalone: true,
    selector: 'vertical-form-example',
    templateUrl: 'vertical-form-example.html',
    imports: [
        FormsModule,
        KbqFormFieldModule,
        KbqInputModule
    ]
})
export class VerticalFormExample {
    value: any;
}
