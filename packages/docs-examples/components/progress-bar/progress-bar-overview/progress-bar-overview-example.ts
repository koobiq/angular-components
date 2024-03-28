import { Component, ViewEncapsulation } from '@angular/core';
import { ThemePalette } from '@koobiq/components/core';


/**
 * @title Basic progress bar
 */
@Component({
    selector: 'progress-bar-overview-example',
    templateUrl: 'progress-bar-overview-example.html',
    styleUrls: ['progress-bar-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class ProgressBarOverviewExample {
    themePalette = ThemePalette;

    percent: number = 30;
}
