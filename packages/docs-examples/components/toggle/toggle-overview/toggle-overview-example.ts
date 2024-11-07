import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ThemePalette } from '@koobiq/components/core';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Toggle
 */
@Component({
    standalone: true,
    selector: 'toggle-overview-example',
    imports: [
        KbqToggleModule,
        FormsModule
    ],
    templateUrl: 'toggle-overview-example.html'
})
export class ToggleOverviewExample {
    themePalette = ThemePalette;

    value: boolean = true;
}
