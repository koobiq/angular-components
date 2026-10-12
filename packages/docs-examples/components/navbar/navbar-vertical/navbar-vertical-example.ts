import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqNavbarModule } from '@koobiq/components/navbar';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { injectExampleText } from '../localized-data';

/**
 * @title Navbar vertical
 */
@Component({
    selector: 'navbar-vertical-example',
    imports: [
        KbqDropdownModule,
        KbqNavbarModule,
        KbqButtonModule,
        KbqToolTipModule,
        KbqIconModule
    ],
    templateUrl: 'navbar-vertical-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarVerticalExample {
    protected readonly text = injectExampleText();

    readonly popUpPlacements = PopUpPlacements;
    readonly colors = KbqComponentColors;
    /** Position of the selected app in `text().apps`, so the selection survives a locale switch. */
    readonly selectedApp = signal(0);
}
