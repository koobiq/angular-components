import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqNavbarModule } from '@koobiq/components/navbar';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { injectExampleText } from '../localized-data';

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
    protected readonly text = injectExampleText();

    readonly popUpPlacements = PopUpPlacements;
    readonly colors = KbqComponentColors;
    /** Position of the selected app in `text().apps`, so the selection survives a locale switch. */
    readonly selectedApp = signal(0);

    /** Uniform navbar links rendered from a single reusable template. */
    readonly items = computed<readonly NavbarLink[]>(() => [
        { icon: 'kbq-stop_16', label: this.text().dashboards, active: true },
        { icon: 'kbq-stop_16', label: this.text().tasks }
    ]);

    /** Bottom navbar link rendered from the same reusable template. */
    readonly profile = computed<NavbarLink>(() => ({ icon: 'kbq-user_16', label: this.text().profile }));
}
