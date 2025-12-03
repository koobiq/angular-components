import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ThemePalette } from '@koobiq/components/core';
import { KbqLoaderOverlayModule } from '@koobiq/components/loader-overlay';

/**
 * @title Loader-overlay
 */
@Component({
    selector: 'loader-overlay-overview-example',
    imports: [KbqLoaderOverlayModule],
    template: `
        <div class="flex" style="height: 320px">
            text text text text text text text text text text text text text text text text text text text text text
            text text text text text text text text text text text text text text text text text text text text text
            text text text text text text text text text text text text text text text text text text text text text
            text text text text text text text text text text text text text text text text text text text text text
            text text text text text text text text text text text text text text text text text text text text text
            text text text text text text text text text text text text text text text
            <kbq-loader-overlay [caption]="'18,7 МБ из 25 МБ — осталось 2 мин'" [text]="'Создание отчета'" />
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderOverlayOverviewExample {
    themePalette = ThemePalette;
}
