import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLoaderOverlayModule } from '@koobiq/components/loader-overlay';
import { KbqProgressSpinnerModule } from '@koobiq/components/progress-spinner';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Loader-overlay fixed-top
 */
@Component({
    selector: 'loader-overlay-fixed-top-example',
    imports: [KbqLoaderOverlayModule, KbqProgressSpinnerModule],
    template: `
        <div class="flex" style="height: 320px">
            text text text text text text text text text text text text text text text text text text text text text
            text text text text text text text text text text text text text text text text text text text text text
            text text text text text text text text text text text text text text text text text text text text text
            text text text text text text text text text text text text text text text text text text text text text
            text text text text text text text text text text text text text text text text text text text text text
            text text text text text text text text text text text text text text text
            <kbq-loader-overlay fixed-top>
                <kbq-progress-spinner kbq-loader-overlay-indicator size="big" [mode]="'indeterminate'" />

                <div kbq-loader-overlay-text>{{ t().creatingReport }}</div>
                <div kbq-loader-overlay-caption>{{ t().reportProgress }}</div>
            </kbq-loader-overlay>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderOverlayFixedTopExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
}
