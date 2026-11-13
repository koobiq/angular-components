import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqNavbarModule } from '@koobiq/components/navbar';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Navbar vertical app long name
 */
@Component({
    selector: 'navbar-vertical-app-long-name-example',
    imports: [
        KbqNavbarModule,
        KbqButtonModule,
        KbqToolTipModule,
        KbqIconModule
    ],
    templateUrl: 'navbar-vertical-app-long-name-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarVerticalAppLongNameExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    readonly popUpPlacements = PopUpPlacements;
    readonly colors = KbqComponentColors;
}
