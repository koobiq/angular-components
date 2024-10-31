import { Component, ViewEncapsulation } from '@angular/core';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqFormFieldModule } from '@koobiq/components/form-field';

/**
 * @title Checkbox overview
 */
@Component({
    standalone: true,
    selector: 'checkbox-overview-example',
    templateUrl: 'checkbox-overview-example.html',
    styleUrl: 'checkbox-overview-example.css',
    imports: [
        KbqCheckboxModule,
        KbqFormFieldModule
    ],
    encapsulation: ViewEncapsulation.None
})
export class CheckboxOverviewExample {}
