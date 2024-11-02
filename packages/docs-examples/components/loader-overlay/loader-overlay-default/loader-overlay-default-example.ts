import { Component } from '@angular/core';
import { ThemePalette } from '@koobiq/components/core';
import { KbqLoaderOverlayModule } from '@koobiq/components/loader-overlay';

/**
 * @title Loader-overlay default
 */
@Component({
    standalone: true,
    selector: 'loader-overlay-default-example',
    imports: [KbqLoaderOverlayModule],
    template: `
        <div
            class="flex"
            style="width: 500px; height: 320px"
        >
            text text text text text text text text text text text text text text text text text text text text text
            text text text text text text text text text text text text text text text text text text text text text
            text text text text text text text text text text text text text text text text text text text text text
            text text text text text text text text text text text text text text text text text text text text text
            text text text text text text text text text text text text text text text text text text text text text
            text text text text text text text text text text text text text text text
            <kbq-loader-overlay [text]="'Загрузка'" />
        </div>
    `
})
export class LoaderOverlayDefaultExample {
    themePalette = ThemePalette;
}
