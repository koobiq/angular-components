import { Component, ViewEncapsulation } from '@angular/core';
import { ThemePalette } from '@koobiq/components/core';

/**
 * @title Indeterminate progress spinner
 */
@Component({
    selector: 'progress-spinner-indeterminate-example',
    templateUrl: 'progress-spinner-indeterminate-example.html',
    styleUrls: ['progress-spinner-indeterminate-example.css'],
    encapsulation: ViewEncapsulation.None,
})
export class ProgressSpinnerIndeterminateExample {
    themePalette = ThemePalette;
}
