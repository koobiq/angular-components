import { Component, ViewEncapsulation } from '@angular/core';
import { ThemePalette } from '@koobiq/components/core';


/**
 * @title Radio style
 */
@Component({
    selector: 'radio-style-example',
    templateUrl: 'radio-style-example.html',
    styleUrls: ['radio-style-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class RadioStyleExample {
    protected readonly themePalette = ThemePalette;
}
