import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ThemePalette } from '@koobiq/components/core';
import { KbqLoaderOverlayModule } from '@koobiq/components/loader-overlay';
import { KbqProgressSpinnerModule } from '@koobiq/components/progress-spinner';

/**
 * @title Loader-overlay large
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'loader-overlay-large-example',
    imports: [KbqLoaderOverlayModule, KbqProgressSpinnerModule],
    template: `
        <div class="flex" style="height: 320px">
            text text text text text text text text text text text text text text text text text text text text text
            text text text text text text text text text text text text text text text text text text text text text
            text text text text text text text text text text text text text text text text text text text text text
            text text text text text text text text text text text text text text text text text text text text text
            text text text text text text text text text text text text text text text text text text text text text
            text text text text text text text text text text text text text text text
            <kbq-loader-overlay [text]="'Загрузка данных'">
                <kbq-progress-spinner size="big" kbq-loader-overlay-indicator [mode]="'indeterminate'" />
            </kbq-loader-overlay>
        </div>
    `
})
export class LoaderOverlayLargeExample {
    themePalette = ThemePalette;
}
