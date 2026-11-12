import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Dropdown lazy load data
 */
@Component({
    selector: 'dropdown-lazyload-data-example',
    imports: [
        KbqDropdownModule,
        FormsModule,
        KbqButtonModule,
        KbqIconModule,
        KbqInputModule
    ],
    templateUrl: 'dropdown-lazyload-data-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownLazyloadDataExample extends BaseLocalizedExample<ExampleTranslation> {
    someValue = 'Lazy Value';

    constructor() {
        super(TRANSLATIONS);
    }
}
