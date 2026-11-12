import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqLoaderOverlayModule } from '@koobiq/components/loader-overlay';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Loader-overlay default
 */
@Component({
    selector: 'loader-overlay-default-example',
    imports: [KbqLoaderOverlayModule],
    template: `
        <div class="flex" style="height: 320px">
            text text text text text text text text text text text text text text text text text text text text text
            text text text text text text text text text text text text text text text text text text text text text
            text text text text text text text text text text text text text text text text text text text text text
            text text text text text text text text text text text text text text text text text text text text text
            text text text text text text text text text text text text text text text text text text text text text
            text text text text text text text text text text text text text text text
            <kbq-loader-overlay [text]="text().loading" />
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderOverlayDefaultExample extends BaseLocalizedExample<ExampleText> {
    constructor() {
        super(TEXT);
    }
}
