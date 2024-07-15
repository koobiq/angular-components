import { Component, ViewEncapsulation } from '@angular/core';
import { ThemePalette } from '@koobiq/components/core';

/**
 * @title Indeterminate progress bar
 */
@Component({
    selector: 'progress-bar-indeterminate-example',
    templateUrl: 'progress-bar-indeterminate-example.html',
    styleUrls: ['progress-bar-indeterminate-example.css'],
    encapsulation: ViewEncapsulation.None,
})
export class ProgressBarIndeterminateExample {
    themePalette = ThemePalette;
}
