import { Component, ViewEncapsulation } from '@angular/core';
import { ThemePalette } from '@koobiq/components/core';

/**
 * @title Loader overlay (fixed-top)
 */
@Component({
    selector: 'loader-overlay-fixed-top-example',
    templateUrl: 'loader-overlay-fixed-top-example.html',
    styleUrls: ['loader-overlay-fixed-top-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class LoaderOverlayFixedTopExample {
    themePalette = ThemePalette;
}
