import { Component } from '@angular/core';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqFormFieldModule } from '@koobiq/components/form-field';

/**
 * @title Checkbox
 */
@Component({
    standalone: true,
    selector: 'checkbox-overview-example',
    templateUrl: 'checkbox-overview-example.html',
    styleUrls: ['checkbox-overview-example.css'],
    imports: [
        KbqCheckboxModule,
        KbqFormFieldModule
    ]
})
export class CheckboxOverviewExample {}
