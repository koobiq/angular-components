import { Component, ViewEncapsulation } from '@angular/core';
import { ThemePalette } from '@koobiq/components/core';


/**
 * @title Loader overlay
 */
@Component({
    selector: 'loader-overlay-overview-example',
    templateUrl: 'loader-overlay-overview-example.html',
    styleUrls: ['loader-overlay-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class LoaderOverlayOverviewExample {
    themePalette = ThemePalette;
}
