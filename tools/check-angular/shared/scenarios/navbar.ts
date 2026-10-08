import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { DropdownCloseReason, KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqNavbar, KbqNavbarModule, KbqVerticalNavbar } from '@koobiq/components/navbar';

/** A section of the application, rendered as an item of both navbars. */
export interface NavbarSection {
    id: string;
    title: string;
    icon: string;
}

/** The sections the application starts with. */
export const NAVBAR_SECTIONS: readonly NavbarSection[] = [
    { id: 'dashboards', title: 'Dashboards', icon: 'kbq-dashboard_16' },
    { id: 'tasks', title: 'Tasks', icon: 'kbq-list_16' },
    { id: 'reports', title: 'Reports', icon: 'kbq-chart-bar_16' }
];

/**
 * An application shell: a horizontal navbar with a brand, the sections and an account menu, and a vertical navbar
 * with the same sections that the user expands and collapses. The sections come from a signal, so they can be
 * added and removed at runtime.
 */
@Component({
    selector: 'check-navbar',
    imports: [KbqNavbarModule, KbqDropdownModule, KbqIconModule],
    template: `
        <kbq-navbar aria-label="Main">
            <kbq-navbar-container>
                <a kbq-navbar-brand href="#">
                    <kbq-navbar-logo>
                        <i kbq-icon="kbq-circle-xs_16"></i>
                    </kbq-navbar-logo>
                    <kbq-navbar-title>Koobiq</kbq-navbar-title>
                </a>

                @for (section of sections(); track section.id) {
                    <kbq-navbar-item
                        [attr.data-section]="section.id"
                        [class.kbq-active]="activeSection() === section.id"
                        (click)="activeSection.set(section.id)"
                    >
                        <i [kbq-icon]="section.icon"></i>
                        <kbq-navbar-title>{{ section.title }}</kbq-navbar-title>
                    </kbq-navbar-item>
                }
            </kbq-navbar-container>

            <kbq-navbar-container>
                <kbq-navbar-item
                    #accountTrigger="kbqDropdownTrigger"
                    data-section="account"
                    [class.kbq-active]="accountTrigger.opened"
                    [kbqDropdownTriggerFor]="accountMenu"
                    (dropdownOpened)="accountMenuEvents.push('opened')"
                    (dropdownClosed)="accountMenuEvents.push('closed')"
                >
                    <i kbq-icon="kbq-user_16"></i>
                    <kbq-navbar-title>Account</kbq-navbar-title>
                </kbq-navbar-item>
            </kbq-navbar-container>
        </kbq-navbar>

        <kbq-dropdown #accountMenu="kbqDropdown" (closed)="accountMenuCloseReasons.push($event)">
            <button kbq-dropdown-item (click)="accountAction.set('profile')">Profile</button>
            <button kbq-dropdown-item (click)="accountAction.set('sign-out')">Sign out</button>
        </kbq-dropdown>

        <kbq-vertical-navbar aria-label="Sections" [(expanded)]="sidebarExpanded">
            <kbq-navbar-container>
                @for (section of sections(); track section.id) {
                    <kbq-navbar-item [attr.data-section]="section.id" (click)="activeSection.set(section.id)">
                        <i [kbq-icon]="section.icon"></i>
                        <kbq-navbar-title>{{ section.title }}</kbq-navbar-title>
                    </kbq-navbar-item>
                }
            </kbq-navbar-container>

            <button kbq-navbar-toggle></button>
        </kbq-vertical-navbar>

        <button type="button" class="check-navbar-outside">Outside</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarScenario {
    readonly navbar = viewChild.required(KbqNavbar);
    readonly verticalNavbar = viewChild.required(KbqVerticalNavbar);

    readonly sections = signal<NavbarSection[]>([...NAVBAR_SECTIONS]);
    readonly activeSection = signal<string | null>(null);
    readonly accountAction = signal<string | null>(null);
    readonly sidebarExpanded = signal(false);

    readonly accountMenuEvents: string[] = [];
    readonly accountMenuCloseReasons: DropdownCloseReason[] = [];

    addSection(section: NavbarSection): void {
        this.sections.update((sections) => [...sections, section]);
    }

    removeSection(id: string): void {
        this.sections.update((sections) => sections.filter((section) => section.id !== id));
    }
}
