import { Component, ViewEncapsulation } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';

/**
 * @title Icon Item Variant
 */
@Component({
    selector: 'icon-item-variant-example',
    templateUrl: 'icon-item-variant-example.html',
    styleUrls: ['icon-item-variant-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class IconItemVariantExample {
    colors = KbqComponentColors;
}
