import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqOptionModule } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTitleModule } from '@koobiq/components/title';

/**
 * @title Dropdown
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'dropdown-overview-example',
    imports: [
        KbqDropdownModule,
        KbqDividerModule,
        KbqButtonModule,
        KbqIconModule,
        KbqTitleModule,
        KbqOptionModule
    ],
    templateUrl: 'dropdown-overview-example.html'
})
export class DropdownOverviewExample {}
