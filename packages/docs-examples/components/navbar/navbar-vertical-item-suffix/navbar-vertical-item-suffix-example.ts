import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqNavbarModule } from '@koobiq/components/navbar';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Navbar vertical item with an icon after the title
 */
@Component({
    selector: 'navbar-vertical-item-suffix-example',
    imports: [KbqNavbarModule, KbqIconModule],
    templateUrl: 'navbar-vertical-item-suffix-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarVerticalItemSuffixExample extends BaseLocalizedExample<ExampleTranslation> {
    constructor() {
        super(TRANSLATIONS);
    }
}
