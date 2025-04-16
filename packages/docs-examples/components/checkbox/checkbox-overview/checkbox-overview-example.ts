import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqFormFieldModule } from '@koobiq/components/form-field';

/**
 * @title Checkbox
 */
@Component({
    standalone: true,
    selector: 'checkbox-overview-example',
    templateUrl: 'checkbox-overview-example.html',
    imports: [
        KbqCheckboxModule,
        KbqFormFieldModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckboxOverviewExample {}
