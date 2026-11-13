import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqNavbarModule } from '@koobiq/components/navbar';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

type NavbarLink = {
    icon: string;
    label: string;
    active?: boolean;
};

/**
 * @title Navbar items from a template
 */
@Component({
    selector: 'navbar-template-outlet-example',
    imports: [
        KbqDropdownModule,
        KbqNavbarModule,
        KbqButtonModule,
        KbqToolTipModule,
        KbqIconModule,
        NgTemplateOutlet
    ],
    templateUrl: 'navbar-template-outlet-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarTemplateOutletExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    readonly popUpPlacements = PopUpPlacements;
    readonly colors = KbqComponentColors;
    /** Position of the selected app in `t().apps`, so the selection survives a locale switch. */
    readonly selectedApp = signal(0);

    /** Uniform navbar links rendered from a single reusable template. */
    readonly items = computed<readonly NavbarLink[]>(() => [
        { icon: 'kbq-stop_16', label: this.t().dashboards, active: true },
        { icon: 'kbq-stop_16', label: this.t().tasks }
    ]);

    /** Bottom navbar link rendered from the same reusable template. */
    readonly profile = computed<NavbarLink>(() => ({ icon: 'kbq-user_16', label: this.t().profile }));
}
