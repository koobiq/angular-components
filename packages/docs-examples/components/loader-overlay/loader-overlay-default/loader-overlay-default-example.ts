import { Component, ViewEncapsulation } from '@angular/core';
import { ThemePalette } from '@koobiq/components/core';

/**
 * @title Loader overlay (default)
 */
@Component({
    selector: 'loader-overlay-default-example',
    templateUrl: 'loader-overlay-default-example.html',
    styleUrls: ['loader-overlay-default-example.css'],
    encapsulation: ViewEncapsulation.None,
})
export class LoaderOverlayDefaultExample {
    themePalette = ThemePalette;
}
