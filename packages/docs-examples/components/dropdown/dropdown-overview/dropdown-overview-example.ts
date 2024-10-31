import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTitleModule } from '@koobiq/components/title';

/**
 * @title Dropdown
 */
@Component({
    standalone: true,
    selector: 'dropdown-overview-example',
    imports: [
        KbqDropdownModule,
        FormsModule,
        KbqCheckboxModule,
        KbqDividerModule,
        KbqButtonModule,
        KbqIconModule,
        KbqTitleModule,
        KbqFormFieldModule,
        KbqInputModule
    ],
    templateUrl: 'dropdown-overview-example.html'
})
export class DropdownOverviewExample {
    someValue = 'Lazy Value';
    disabled = false;
    openByArrowDown = true;
}
