import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLoaderOverlayModule } from '@koobiq/components/loader-overlay';
import { KbqProgressSpinnerModule } from '@koobiq/components/progress-spinner';
import { injectExampleText } from '../l10n';

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

                <div kbq-loader-overlay-text>{{ text().creatingReport }}</div>
                <div kbq-loader-overlay-caption>{{ text().reportProgress }}</div>
            </kbq-loader-overlay>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderOverlayFixedTopExample {
    protected readonly text = injectExampleText();
}
