import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLoaderOverlayModule } from '@koobiq/components/loader-overlay';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

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
            <kbq-loader-overlay [caption]="text().reportProgress" [text]="text().creatingReport" />
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderOverlayOverviewExample extends BaseLocalizedExample<ExampleText> {
    constructor() {
        super(TEXT);
    }
}
