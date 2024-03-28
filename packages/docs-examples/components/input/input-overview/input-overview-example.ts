import { Component, ViewEncapsulation } from '@angular/core';
import { ThemePalette } from '@koobiq/components/core';


/**
 * @title Basic Input
 */
@Component({
    selector: 'input-overview-example',
    templateUrl: 'input-overview-example.html',
    styleUrls: ['input-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class InputOverviewExample {
    themePalette = ThemePalette;
    value = '';
}
