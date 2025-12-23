import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqNavbarModule } from './navbar.module';

@Component({
    selector: 'e2e-horizontal-navbar-states',
    imports: [KbqNavbarModule, KbqBadgeModule, KbqButtonModule, KbqIconModule, KbqDividerModule, KbqDropdownModule],
    template: `
        <div data-testid="e2eScreenshotTarget">
            <kbq-dropdown #horizontalNavbarDropdownApps="kbqDropdown" />

            <kbq-navbar>
                <kbq-navbar-container>
                    <kbq-navbar-item
                        #horizontalNavbarDropdownAppsDropdownTrigger="kbqDropdownTrigger"
                        bento
                        [class.kbq-active]="horizontalNavbarDropdownAppsDropdownTrigger.opened"
                        [kbqDropdownTriggerFor]="horizontalNavbarDropdownApps"
                    >
                        <i kbq-icon="kbq-bento-menu_16"></i>
                    </kbq-navbar-item>

                    <a href="#" kbq-navbar-brand>
                        <kbq-navbar-logo>
                            <!-- prettier-ignore -->
                            <svg fill="none" height="32" viewBox="0 0 32 32" width="32" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="M0 25.6C0 28.4045 0 29.9635 1.01826 30.9817C2.03651 32 3.59554 32 6.4 32H25.6C28.4045 32 29.9635 32 30.9817 30.9817C32 29.9635 32 28.4045 32 25.6V6.4C32 3.59554 32 2.03651 30.9817 1.01826C29.9635 0 28.4045 0 25.6 0H6.4C3.59554 0 2.03651 0 1.01826 1.01826C0 2.03651 0 3.59554 0 6.4V25.6Z" fill="#FF0000" fill-rule="evenodd"/><path d="M14.9774 16L11.1933 19.7841L7.40918 16L11.1933 12.267L14.9774 16ZM19.7842 20.858L16.0512 24.5909L12.2671 20.858L16.0512 17.0739L19.7842 20.858ZM19.7842 11.1932L16.0512 14.9261L12.2671 11.1932L16.0512 7.40909L19.7842 11.1932ZM24.591 16L20.858 19.7841L17.1251 16L20.858 12.267L24.591 16Z" fill="white"/></svg>
                        </kbq-navbar-logo>
                        <kbq-navbar-title>App name</kbq-navbar-title>
                    </a>

                    <button kbq-navbar-item>
                        <i kbq-icon="kbq-folder_16"></i>
                    </button>

                    <kbq-navbar-item class="kbq-hovered">
                        <kbq-navbar-title>Задачи</kbq-navbar-title>
                    </kbq-navbar-item>

                    <kbq-navbar-item class="kbq-active">
                        <kbq-navbar-title>Задачи</kbq-navbar-title>
                    </kbq-navbar-item>

                    <kbq-navbar-item class="cdk-focused cdk-keyboard-focused">
                        <kbq-navbar-title>Задачи</kbq-navbar-title>
                    </kbq-navbar-item>

                    <kbq-navbar-item class="kbq-disabled">
                        <kbq-navbar-title>Задачи</kbq-navbar-title>
                    </kbq-navbar-item>

                    <kbq-navbar-item
                        #horizontalNavbarProjectsDropdownTrigger="kbqDropdownTrigger"
                        [class.kbq-active]="horizontalNavbarProjectsDropdownTrigger.opened"
                        [kbqDropdownTriggerFor]="horizontalNavbarDropdownApps"
                    >
                        <kbq-navbar-title>Проекты</kbq-navbar-title>
                    </kbq-navbar-item>

                    <kbq-navbar-item>
                        <button kbq-button [color]="'contrast'">
                            <span>Новая задача</span>
                        </button>
                    </kbq-navbar-item>
                </kbq-navbar-container>

                <kbq-navbar-container>
                    <kbq-navbar-item>
                        <i kbq-icon="kbq-bell_16"></i>
                        <kbq-badge [badgeColor]="'error'" [compact]="true">5</kbq-badge>
                    </kbq-navbar-item>

                    <kbq-navbar-item>
                        <i kbq-icon="kbq-gear_16"></i>
                    </kbq-navbar-item>

                    <kbq-navbar-divider />

                    <kbq-navbar-item>
                        <i kbq-icon="kbq-magnifying-glass_16"></i>
                    </kbq-navbar-item>

                    <kbq-navbar-item>
                        <i kbq-icon="kbq-user_16"></i>
                    </kbq-navbar-item>
                </kbq-navbar-container>
            </kbq-navbar>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eNavbarStates'
    }
})
export class E2eHorizontalNavbarStates {}

@Component({
    selector: 'e2e-vertical-navbar-states',
    imports: [
        KbqNavbarModule,
        KbqBadgeModule,
        KbqButtonModule,
        KbqIconModule,
        KbqDividerModule,
        KbqDropdownModule
    ],
    template: `
        <div
            data-testid="e2eScreenshotTarget"
            style="width: 700px; height: 600px; display: flex; flex-direction: row; gap: 20px"
        >
            <kbq-dropdown #verticalNavbarDropdown_1="kbqDropdown" />

            <kbq-vertical-navbar #verticalNavbar>
                <kbq-navbar-container>
                    <div
                        #verticalNavbarDropdownTrigger_1="kbqDropdownTrigger"
                        bento
                        kbq-navbar-item
                        [class.kbq-active]="verticalNavbarDropdownTrigger_1.opened"
                        [kbqDropdownTriggerFor]="verticalNavbarDropdown_1"
                    >
                        <i kbq-icon="kbq-bento-menu_16"></i>

                        <span kbq-navbar-title>
                            App NameApp NameApp NameApp NameApp NameApp NameApp NameApp NameApp NameApp Name
                        </span>
                    </div>

                    <a href="#" kbq-navbar-brand [longTitle]="true">
                        <div kbq-navbar-logo>
                            <!-- prettier-ignore -->
                            <svg fill="none" height="32" viewBox="0 0 32 32" width="32" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="M0 25.6C0 28.4045 0 29.9635 1.01826 30.9817C2.03651 32 3.59554 32 6.4 32H25.6C28.4045 32 29.9635 32 30.9817 30.9817C32 29.9635 32 28.4045 32 25.6V6.4C32 3.59554 32 2.03651 30.9817 1.01826C29.9635 0 28.4045 0 25.6 0H6.4C3.59554 0 2.03651 0 1.01826 1.01826C0 2.03651 0 3.59554 0 6.4V25.6Z" fill="#FF0000" fill-rule="evenodd"/><path d="M14.9774 16L11.1933 19.7841L7.40918 16L11.1933 12.267L14.9774 16ZM19.7842 20.858L16.0512 24.5909L12.2671 20.858L16.0512 17.0739L19.7842 20.858ZM19.7842 11.1932L16.0512 14.9261L12.2671 11.1932L16.0512 7.40909L19.7842 11.1932ZM24.591 16L20.858 19.7841L17.1251 16L20.858 12.267L24.591 16Z" fill="white"/></svg>
                        </div>

                        <div kbq-navbar-title>App NameA</div>
                    </a>

                    <button kbq-navbar-item class="kbq-hovered">
                        <i kbq-icon="kbq-folder-open_16"></i>
                        <span kbq-navbar-title>Задачи</span>
                    </button>

                    <button kbq-navbar-item class="kbq-active">
                        <i kbq-icon="kbq-folder-open_16"></i>
                        <span kbq-navbar-title>Задачи</span>
                    </button>

                    <button kbq-navbar-item class="cdk-focused cdk-keyboard-focused">
                        <i kbq-icon="kbq-folder-open_16"></i>
                        <span kbq-navbar-title>Задачи</span>
                    </button>

                    <button kbq-navbar-item class="kbq-disabled">
                        <i kbq-icon="kbq-folder-open_16"></i>
                        <span kbq-navbar-title>Задачи</span>
                    </button>

                    <kbq-navbar-item
                        #verticalNavbarDropdownTrigger_3="kbqDropdownTrigger"
                        [class.kbq-active]="verticalNavbarDropdownTrigger_3.opened"
                        [kbqDropdownTriggerFor]="verticalNavbarDropdown_1"
                    >
                        <i kbq-icon="kbq-ellipsis-vertical_16"></i>
                        <kbq-navbar-title>Еще</kbq-navbar-title>
                    </kbq-navbar-item>

                    <kbq-navbar-item>
                        <button
                            kbq-button
                            [class.kbq-button-icon]="!verticalNavbar.expanded"
                            [color]="'contrast'"
                            [kbqStyle]="'filled'"
                        >
                            <i kbq-icon="kbq-bell_16"></i>
                            @if (verticalNavbar.expanded) {
                                <span>Новый инцидент</span>
                            }
                        </button>
                    </kbq-navbar-item>
                </kbq-navbar-container>

                <kbq-navbar-container>
                    <kbq-navbar-item>
                        <i kbq-icon="kbq-bell_16"></i>
                        <kbq-navbar-title>Уведомления</kbq-navbar-title>
                        <kbq-badge [badgeColor]="'error'" [compact]="true">2</kbq-badge>
                    </kbq-navbar-item>

                    <kbq-navbar-divider />

                    <kbq-navbar-item>
                        <i kbq-icon="kbq-gear_16"></i>
                        <kbq-navbar-title>Настройки</kbq-navbar-title>
                    </kbq-navbar-item>
                </kbq-navbar-container>
                <button kbq-navbar-toggle></button>
            </kbq-vertical-navbar>

            <kbq-vertical-navbar #verticalNavbar_2 class="kbq-hovered">
                <kbq-navbar-container>
                    <div
                        #verticalNavbarDropdownTrigger_1="kbqDropdownTrigger"
                        bento
                        kbq-navbar-item
                        [class.kbq-active]="verticalNavbarDropdownTrigger_1.opened"
                        [kbqDropdownTriggerFor]="verticalNavbarDropdown_1"
                    >
                        <i kbq-icon="kbq-bento-menu_16"></i>

                        <span kbq-navbar-title>
                            App NameApp NameApp NameApp NameApp NameApp NameApp NameApp NameApp NameApp Name
                        </span>
                    </div>

                    <a href="#" kbq-navbar-brand [longTitle]="true">
                        <div kbq-navbar-logo>
                            <!-- prettier-ignore -->
                            <svg fill="none" height="32" viewBox="0 0 32 32" width="32" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="M0 25.6C0 28.4045 0 29.9635 1.01826 30.9817C2.03651 32 3.59554 32 6.4 32H25.6C28.4045 32 29.9635 32 30.9817 30.9817C32 29.9635 32 28.4045 32 25.6V6.4C32 3.59554 32 2.03651 30.9817 1.01826C29.9635 0 28.4045 0 25.6 0H6.4C3.59554 0 2.03651 0 1.01826 1.01826C0 2.03651 0 3.59554 0 6.4V25.6Z" fill="#FF0000" fill-rule="evenodd"/><path d="M14.9774 16L11.1933 19.7841L7.40918 16L11.1933 12.267L14.9774 16ZM19.7842 20.858L16.0512 24.5909L12.2671 20.858L16.0512 17.0739L19.7842 20.858ZM19.7842 11.1932L16.0512 14.9261L12.2671 11.1932L16.0512 7.40909L19.7842 11.1932ZM24.591 16L20.858 19.7841L17.1251 16L20.858 12.267L24.591 16Z" fill="white"/></svg>
                        </div>

                        <div kbq-navbar-title>App NameA</div>
                    </a>

                    <button kbq-navbar-item class="kbq-hovered">
                        <i kbq-icon="kbq-folder-open_16"></i>
                        <span kbq-navbar-title>Задачи</span>
                    </button>

                    <button kbq-navbar-item class="kbq-active">
                        <i kbq-icon="kbq-folder-open_16"></i>
                        <span kbq-navbar-title>Задачи</span>
                    </button>

                    <button kbq-navbar-item class="cdk-focused cdk-keyboard-focused">
                        <i kbq-icon="kbq-folder-open_16"></i>
                        <span kbq-navbar-title>Задачи</span>
                    </button>

                    <button kbq-navbar-item class="kbq-disabled">
                        <i kbq-icon="kbq-folder-open_16"></i>
                        <span kbq-navbar-title>Задачи</span>
                    </button>

                    <kbq-navbar-item
                        #verticalNavbarDropdownTrigger_3="kbqDropdownTrigger"
                        [class.kbq-active]="verticalNavbarDropdownTrigger_3.opened"
                        [kbqDropdownTriggerFor]="verticalNavbarDropdown_1"
                    >
                        <i kbq-icon="kbq-ellipsis-vertical_16"></i>
                        <kbq-navbar-title>Еще</kbq-navbar-title>
                    </kbq-navbar-item>

                    <kbq-navbar-item>
                        <button
                            kbq-button
                            [class.kbq-button-icon]="!verticalNavbar_2.expanded"
                            [color]="'contrast'"
                            [kbqStyle]="'filled'"
                        >
                            <i kbq-icon="kbq-bell_16"></i>
                            @if (verticalNavbar_2.expanded) {
                                <span>Новый инцидент</span>
                            }
                        </button>
                    </kbq-navbar-item>
                </kbq-navbar-container>

                <kbq-navbar-container>
                    <kbq-navbar-item>
                        <i kbq-icon="kbq-bell_16"></i>
                        <kbq-navbar-title>Уведомления</kbq-navbar-title>
                        <kbq-badge [badgeColor]="'error'" [compact]="true">2</kbq-badge>
                    </kbq-navbar-item>

                    <kbq-navbar-divider />

                    <kbq-navbar-item>
                        <i kbq-icon="kbq-gear_16"></i>
                        <kbq-navbar-title>Настройки</kbq-navbar-title>
                    </kbq-navbar-item>
                </kbq-navbar-container>
                <button kbq-navbar-toggle></button>
            </kbq-vertical-navbar>

            <kbq-vertical-navbar #verticalNavbar_3 [expanded]="true">
                <kbq-navbar-container>
                    <div
                        #verticalNavbarDropdownTrigger_1="kbqDropdownTrigger"
                        bento
                        kbq-navbar-item
                        [class.kbq-active]="verticalNavbarDropdownTrigger_1.opened"
                        [kbqDropdownTriggerFor]="verticalNavbarDropdown_1"
                    >
                        <i kbq-icon="kbq-bento-menu_16"></i>

                        <span kbq-navbar-title>
                            App NameApp NameApp NameApp NameApp NameApp NameApp NameApp NameApp NameApp Name
                        </span>
                    </div>

                    <a href="#" kbq-navbar-brand [longTitle]="true">
                        <div kbq-navbar-logo>
                            <!-- prettier-ignore -->
                            <svg fill="none" height="32" viewBox="0 0 32 32" width="32" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="M0 25.6C0 28.4045 0 29.9635 1.01826 30.9817C2.03651 32 3.59554 32 6.4 32H25.6C28.4045 32 29.9635 32 30.9817 30.9817C32 29.9635 32 28.4045 32 25.6V6.4C32 3.59554 32 2.03651 30.9817 1.01826C29.9635 0 28.4045 0 25.6 0H6.4C3.59554 0 2.03651 0 1.01826 1.01826C0 2.03651 0 3.59554 0 6.4V25.6Z" fill="#FF0000" fill-rule="evenodd"/><path d="M14.9774 16L11.1933 19.7841L7.40918 16L11.1933 12.267L14.9774 16ZM19.7842 20.858L16.0512 24.5909L12.2671 20.858L16.0512 17.0739L19.7842 20.858ZM19.7842 11.1932L16.0512 14.9261L12.2671 11.1932L16.0512 7.40909L19.7842 11.1932ZM24.591 16L20.858 19.7841L17.1251 16L20.858 12.267L24.591 16Z" fill="white"/></svg>
                        </div>

                        <div kbq-navbar-title>App NameA</div>
                    </a>

                    <button kbq-navbar-item class="kbq-hovered">
                        <i kbq-icon="kbq-folder-open_16"></i>
                        <span kbq-navbar-title>Задачи</span>
                    </button>

                    <button kbq-navbar-item class="kbq-active">
                        <i kbq-icon="kbq-folder-open_16"></i>
                        <span kbq-navbar-title>Задачи</span>
                    </button>

                    <button kbq-navbar-item class="cdk-focused cdk-keyboard-focused">
                        <i kbq-icon="kbq-folder-open_16"></i>
                        <span kbq-navbar-title>Задачи</span>
                    </button>

                    <button kbq-navbar-item class="kbq-disabled">
                        <i kbq-icon="kbq-folder-open_16"></i>
                        <span kbq-navbar-title>Задачи</span>
                    </button>

                    <kbq-navbar-item
                        #verticalNavbarDropdownTrigger_3="kbqDropdownTrigger"
                        [class.kbq-active]="verticalNavbarDropdownTrigger_3.opened"
                        [kbqDropdownTriggerFor]="verticalNavbarDropdown_1"
                    >
                        <i kbq-icon="kbq-ellipsis-vertical_16"></i>
                        <kbq-navbar-title>Еще</kbq-navbar-title>
                    </kbq-navbar-item>

                    <kbq-navbar-item>
                        <button
                            kbq-button
                            [class.kbq-button-icon]="!verticalNavbar_3.expanded"
                            [color]="'contrast'"
                            [kbqStyle]="'filled'"
                        >
                            <i kbq-icon="kbq-bell_16"></i>
                            @if (verticalNavbar_3.expanded) {
                                <span>Новый инцидент</span>
                            }
                        </button>
                    </kbq-navbar-item>
                </kbq-navbar-container>

                <kbq-navbar-container>
                    <kbq-navbar-item>
                        <i kbq-icon="kbq-bell_16"></i>
                        <kbq-navbar-title>Уведомления</kbq-navbar-title>
                        <kbq-badge [badgeColor]="'error'" [compact]="true">2</kbq-badge>
                    </kbq-navbar-item>

                    <kbq-navbar-divider />

                    <kbq-navbar-item>
                        <i kbq-icon="kbq-gear_16"></i>
                        <kbq-navbar-title>Настройки</kbq-navbar-title>
                    </kbq-navbar-item>
                </kbq-navbar-container>
                <button kbq-navbar-toggle></button>
            </kbq-vertical-navbar>

            <kbq-vertical-navbar #verticalNavbar_4 class="kbq-hovered" [expanded]="true">
                <kbq-navbar-container>
                    <div
                        #verticalNavbarDropdownTrigger_1="kbqDropdownTrigger"
                        bento
                        kbq-navbar-item
                        [class.kbq-active]="verticalNavbarDropdownTrigger_1.opened"
                        [kbqDropdownTriggerFor]="verticalNavbarDropdown_1"
                    >
                        <i kbq-icon="kbq-bento-menu_16"></i>

                        <span kbq-navbar-title>
                            App NameApp NameApp NameApp NameApp NameApp NameApp NameApp NameApp NameApp Name
                        </span>
                    </div>

                    <a href="#" kbq-navbar-brand [longTitle]="true">
                        <div kbq-navbar-logo>
                            <!-- prettier-ignore -->
                            <svg fill="none" height="32" viewBox="0 0 32 32" width="32" xmlns="http://www.w3.org/2000/svg"><path clip-rule="evenodd" d="M0 25.6C0 28.4045 0 29.9635 1.01826 30.9817C2.03651 32 3.59554 32 6.4 32H25.6C28.4045 32 29.9635 32 30.9817 30.9817C32 29.9635 32 28.4045 32 25.6V6.4C32 3.59554 32 2.03651 30.9817 1.01826C29.9635 0 28.4045 0 25.6 0H6.4C3.59554 0 2.03651 0 1.01826 1.01826C0 2.03651 0 3.59554 0 6.4V25.6Z" fill="#FF0000" fill-rule="evenodd"/><path d="M14.9774 16L11.1933 19.7841L7.40918 16L11.1933 12.267L14.9774 16ZM19.7842 20.858L16.0512 24.5909L12.2671 20.858L16.0512 17.0739L19.7842 20.858ZM19.7842 11.1932L16.0512 14.9261L12.2671 11.1932L16.0512 7.40909L19.7842 11.1932ZM24.591 16L20.858 19.7841L17.1251 16L20.858 12.267L24.591 16Z" fill="white"/></svg>
                        </div>

                        <div kbq-navbar-title>App NameA</div>
                    </a>

                    <button kbq-navbar-item class="kbq-hovered">
                        <i kbq-icon="kbq-folder-open_16"></i>
                        <span kbq-navbar-title>Задачи</span>
                    </button>

                    <button kbq-navbar-item class="kbq-active">
                        <i kbq-icon="kbq-folder-open_16"></i>
                        <span kbq-navbar-title>Задачи</span>
                    </button>

                    <button kbq-navbar-item class="cdk-focused cdk-keyboard-focused">
                        <i kbq-icon="kbq-folder-open_16"></i>
                        <span kbq-navbar-title>Задачи</span>
                    </button>

                    <button kbq-navbar-item class="kbq-disabled">
                        <i kbq-icon="kbq-folder-open_16"></i>
                        <span kbq-navbar-title>Задачи</span>
                    </button>

                    <kbq-navbar-item
                        #verticalNavbarDropdownTrigger_3="kbqDropdownTrigger"
                        [class.kbq-active]="verticalNavbarDropdownTrigger_3.opened"
                        [kbqDropdownTriggerFor]="verticalNavbarDropdown_1"
                    >
                        <i kbq-icon="kbq-ellipsis-vertical_16"></i>
                        <kbq-navbar-title>Еще</kbq-navbar-title>
                    </kbq-navbar-item>

                    <kbq-navbar-item>
                        <button
                            kbq-button
                            [class.kbq-button-icon]="!verticalNavbar_4.expanded"
                            [color]="'contrast'"
                            [kbqStyle]="'filled'"
                        >
                            <i kbq-icon="kbq-bell_16"></i>
                            @if (verticalNavbar_4.expanded) {
                                <span>Новый инцидент</span>
                            }
                        </button>
                    </kbq-navbar-item>
                </kbq-navbar-container>

                <kbq-navbar-container>
                    <kbq-navbar-item>
                        <i kbq-icon="kbq-bell_16"></i>
                        <kbq-navbar-title>Уведомления</kbq-navbar-title>
                        <kbq-badge [badgeColor]="'error'" [compact]="true">2</kbq-badge>
                    </kbq-navbar-item>

                    <kbq-navbar-divider />

                    <kbq-navbar-item>
                        <i kbq-icon="kbq-gear_16"></i>
                        <kbq-navbar-title>Настройки</kbq-navbar-title>
                    </kbq-navbar-item>
                </kbq-navbar-container>
                <button kbq-navbar-toggle></button>
            </kbq-vertical-navbar>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eVerticalNavbarStates'
    }
})
export class E2eVerticalNavbarStates {}
