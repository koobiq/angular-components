import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormsModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * @title Horizontal form labels
 */
@Component({
    selector: 'horizontal-form-labels-example',
    imports: [
        FormsModule,
        KbqFormsModule,
        KbqFormFieldModule,
        KbqInputModule
    ],
    templateUrl: 'horizontal-form-labels-example.html',
    styleUrls: ['horizontal-form-labels-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HorizontalFormLabelsExample {
    value: any;
}
