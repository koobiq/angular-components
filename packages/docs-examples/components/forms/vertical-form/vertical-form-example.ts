import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * @title Vertical form
 */
@Component({
    selector: 'vertical-form-example',
    imports: [
        FormsModule,
        KbqFormsModule,
        KbqFormFieldModule,
        KbqInputModule
    ],
    templateUrl: 'vertical-form-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerticalFormExample {
    value: any;
}
