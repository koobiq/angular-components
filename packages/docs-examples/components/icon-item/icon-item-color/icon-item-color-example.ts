import { Component, ViewEncapsulation } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';

/**
 * @title Icon Item Colors
 */
@Component({
    selector: 'icon-item-color-example',
    templateUrl: 'icon-item-color-example.html',
    styleUrls: ['icon-item-color-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class IconItemColorExample {
    colors = KbqComponentColors;
}
