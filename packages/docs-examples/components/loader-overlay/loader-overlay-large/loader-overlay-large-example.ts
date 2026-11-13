import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLoaderOverlayModule } from '@koobiq/components/loader-overlay';
import { KbqProgressSpinnerModule } from '@koobiq/components/progress-spinner';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Loader-overlay large
 */
@Component({
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
            <kbq-loader-overlay [text]="t().loadingData">
                <kbq-progress-spinner size="big" kbq-loader-overlay-indicator [mode]="'indeterminate'" />
            </kbq-loader-overlay>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderOverlayLargeExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
}
