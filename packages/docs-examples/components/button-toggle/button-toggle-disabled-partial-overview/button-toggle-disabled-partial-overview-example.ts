import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Button toggle disabled partial
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'button-toggle-disabled-partial-overview-example',
    templateUrl: 'button-toggle-disabled-partial-overview-example.html',
    imports: [
        KbqButtonToggleModule,
        KbqIconModule
    ]
})
export class ButtonToggleDisabledPartialOverviewExample {}
