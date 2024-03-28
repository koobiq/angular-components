import { Component, ViewEncapsulation } from '@angular/core';
import { ThemePalette } from '@koobiq/components/core';


/**
 * @title Loader overlay (large)
 */
@Component({
    selector: 'loader-overlay-large-example',
    templateUrl: 'loader-overlay-large-example.html',
    styleUrls: ['loader-overlay-large-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class LoaderOverlayLargeExample {
    themePalette = ThemePalette;
}
