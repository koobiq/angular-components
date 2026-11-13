import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqNavbarModule } from '@koobiq/components/navbar';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Navbar item with an icon after the title
 */
@Component({
    selector: 'navbar-item-suffix-example',
    imports: [KbqNavbarModule, KbqIconModule],
    templateUrl: 'navbar-item-suffix-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarItemSuffixExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
}
