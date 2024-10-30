import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Button toggle disabled all
 */
@Component({
    standalone: true,
    selector: 'button-toggle-disabled-all-overview-example',
    templateUrl: 'button-toggle-disabled-all-overview-example.html',
    imports: [
        KbqButtonToggleModule,
        FormsModule,
        KbqIconModule
    ]
})
export class ButtonToggleDisabledAllOverviewExample {
    model = 1;
}
