import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Dropdown nested
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'dropdown-nested-example',
    imports: [
        KbqDropdownModule,
        KbqButtonModule,
        KbqIconModule,
        KbqDividerModule
    ],
    templateUrl: 'dropdown-nested-example.html'
})
export class DropdownNestedExample {}
