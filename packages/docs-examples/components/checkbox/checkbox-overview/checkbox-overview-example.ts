import { Component, ViewEncapsulation } from '@angular/core';
import { KbqHint } from '@koobiq/components-experimental/form-field';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';

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
        KbqHint
    ],
    encapsulation: ViewEncapsulation.None
})
export class CheckboxOverviewExample {}
