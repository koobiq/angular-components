import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Button toggle
 */
@Component({
    selector: 'button-toggle-overview-example',
    imports: [
        KbqButtonToggleModule,
        KbqIconModule
    ],
    templateUrl: 'button-toggle-overview-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonToggleOverviewExample {}
