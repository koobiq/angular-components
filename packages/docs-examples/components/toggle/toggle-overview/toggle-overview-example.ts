import { Component, ViewEncapsulation } from '@angular/core';
import { ThemePalette } from '@koobiq/components/core';

/**
 * @title Basic toggle
 */
@Component({
    selector: 'toggle-overview-example',
    templateUrl: 'toggle-overview-example.html',
    styleUrls: ['toggle-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class ToggleOverviewExample {
    themePalette = ThemePalette;

    value: boolean = true;
}
