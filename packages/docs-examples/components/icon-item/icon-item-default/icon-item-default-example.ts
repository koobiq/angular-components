import { Component, ViewEncapsulation } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';

/**
 * @title Icon Item
 */
@Component({
    selector: 'icon-item-default-example',
    templateUrl: 'icon-item-default-example.html',
    styleUrls: ['icon-item-default-example.css'],
    encapsulation: ViewEncapsulation.None,
})
export class IconItemDefaultExample {
    colors = KbqComponentColors;
}
