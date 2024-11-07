import { Component } from '@angular/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqRadioModule } from '@koobiq/components/radio';

/**
 * @title Radio content
 */
@Component({
    standalone: true,
    selector: 'radio-content-example',
    imports: [
        KbqRadioModule,
        KbqFormFieldModule
    ],
    templateUrl: 'radio-content-example.html'
})
export class RadioContentExample {
    isDisabled = false;
}
