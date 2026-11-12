import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqNavbarModule } from '@koobiq/components/navbar';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Navbar vertical open over
 */
@Component({
    selector: 'navbar-vertical-open-over-example',
    imports: [
        KbqDropdownModule,
        KbqNavbarModule,
        KbqButtonModule,
        KbqToolTipModule,
        KbqIconModule
    ],
    templateUrl: 'navbar-vertical-open-over-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarVerticalOpenOverExample extends BaseLocalizedExample<ExampleText> {
    popUpPlacements = PopUpPlacements;

    constructor() {
        super(TEXT);
    }
}
