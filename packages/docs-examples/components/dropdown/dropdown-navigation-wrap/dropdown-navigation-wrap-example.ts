import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqOptionModule } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Dropdown navigation wrap
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'dropdown-navigation-wrap-example',
    imports: [
        KbqDropdownModule,
        KbqButtonModule,
        KbqIconModule,
        KbqDividerModule,
        KbqOptionModule
    ],
    templateUrl: 'dropdown-navigation-wrap-example.html'
})
export class DropdownNavigationWrapExample {}
