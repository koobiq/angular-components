import { Component } from '@angular/core';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Button toggle
 */
@Component({
    standalone: true,
    selector: 'button-toggle-overview-example',
    templateUrl: 'button-toggle-overview-example.html',
    imports: [
        KbqButtonToggleModule,
        KbqIconModule
    ]
})
export class ButtonToggleOverviewExample {}
