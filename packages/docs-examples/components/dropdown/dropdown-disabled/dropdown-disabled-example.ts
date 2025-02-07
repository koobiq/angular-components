import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqOptionModule } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTitleModule } from '@koobiq/components/title';

/**
 * @title Dropdown disabled
 */
@Component({
    standalone: true,
    selector: 'dropdown-disabled-example',
    imports: [
        KbqDropdownModule,
        FormsModule,
        KbqCheckboxModule,
        KbqDividerModule,
        KbqButtonModule,
        KbqIconModule,
        KbqTitleModule,
        KbqOptionModule
    ],
    templateUrl: 'dropdown-disabled-example.html'
})
export class DropdownDisabledExample {
    disabled = false;
}
