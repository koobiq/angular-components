import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';

/**
 * @title Dropdown lazy load data
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'dropdown-lazyload-data-example',
    imports: [
        KbqDropdownModule,
        FormsModule,
        KbqButtonModule,
        KbqIconModule,
        KbqFormFieldModule,
        KbqInputModule
    ],
    templateUrl: 'dropdown-lazyload-data-example.html'
})
export class DropdownLazyloadDataExample {
    someValue = 'Lazy Value';
}
