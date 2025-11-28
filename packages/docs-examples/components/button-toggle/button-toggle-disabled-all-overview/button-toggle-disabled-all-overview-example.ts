import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Button toggle disabled all
 */
@Component({
    selector: 'button-toggle-disabled-all-overview-example',
    imports: [
        KbqButtonToggleModule,
        FormsModule,
        KbqIconModule
    ],
    templateUrl: 'button-toggle-disabled-all-overview-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonToggleDisabledAllOverviewExample {
    model = 1;
}
