import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqNavbarModule } from '@koobiq/components/navbar';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

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
    styles: `
        :host ::ng-deep .kbq-vertical-navbar__container {
            border-top-left-radius: 12px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarTemplateOutletExample {
    /** Placement of the action-button tooltip. */
    readonly popUpPlacements = PopUpPlacements;
    /** Color palette used by the action button. */
    readonly colors = KbqComponentColors;
    /** Applications shown in the "Все приложения" dropdown. */
    readonly apps: readonly string[] = ['User Management', 'Knowledge Hub', 'Secret Notes'];
    /** Currently selected application (drives the navbar brand title). */
    readonly selectedApp = signal<string>(this.apps[0]);

    /** Uniform navbar links rendered from a single reusable template. */
    readonly items: readonly NavbarLink[] = [
        { icon: 'kbq-stop_16', label: 'Панель мониторинга', active: true },
        { icon: 'kbq-stop_16', label: 'Задачи' }
    ];

    /** Bottom navbar link rendered from the same reusable template. */
    readonly profile: NavbarLink = { icon: 'kbq-user_16', label: 'Профиль' };
}
