import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqFileUploadModule } from '@koobiq/components/file-upload';
import { KbqFormFieldModule, PasswordRules } from '@koobiq/components/form-field';
import {
    KbqIcon,
    KbqIconButton,
    KbqIconItem,
    KbqIconModule,
    KbqIconRegistry,
    kbqIconsResolverProvider
} from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqNavbarModule } from '@koobiq/components/navbar';
import { KbqSplitButtonModule } from '@koobiq/components/split-button';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { KbqTagsModule } from '@koobiq/components/tags';

type IconStates = {
    color: KbqComponentColors;
};

type IconItemStates = IconStates & {
    state?: 'big' | 'fade';
};

type IconButtonStates = IconStates & {
    state: 'disabled' | 'small' | 'focused' | 'hover';
};

@Component({
    selector: 'e2e-icon-state-and-style',
    imports: [
        KbqIconButton,
        KbqIconItem,
        KbqIcon
    ],
    template: `
        <div>
            <table data-testid="e2eIconTable">
                @for (row of iconStates; track $index) {
                    <tr>
                        @for (cell of row; track $index) {
                            <td>
                                <i kbq-icon="kbq-chevron-down-s_16" [color]="cell.color"></i>
                            </td>
                        }
                    </tr>
                }

                @for (row of iconItemStates; track $index) {
                    <tr>
                        @for (cell of row; track $index) {
                            <td>
                                <i
                                    kbq-icon-item="kbq-chevron-down-s_16"
                                    [color]="cell.color"
                                    [big]="cell.state === 'big'"
                                    [fade]="cell.state === 'fade'"
                                ></i>
                            </td>
                        }
                    </tr>
                }

                @for (row of iconButtonStates; track $index) {
                    <tr class="e2e-icon-button-row">
                        @for (cell of row; track $index) {
                            <td>
                                <i
                                    kbq-icon-button="kbq-chevron-down-s_16"
                                    [color]="cell.color"
                                    [small]="cell.state === 'small'"
                                    [disabled]="cell.state === 'disabled'"
                                    [class.kbq-hovered]="cell.state === 'hover'"
                                    [class.cdk-keyboard-focused]="cell.state === 'focused'"
                                ></i>
                            </td>
                        }
                    </tr>
                }

                @for (row of iconButtonStates; track $index) {
                    <tr class="e2e-icon-button-row">
                        @for (cell of row; track $index) {
                            <td>
                                <button
                                    kbq-icon-button="kbq-chevron-down-s_16"
                                    [color]="cell.color"
                                    [small]="cell.state === 'small'"
                                    [disabled]="cell.state === 'disabled'"
                                    [class.kbq-hovered]="cell.state === 'hover'"
                                    [class.cdk-keyboard-focused]="cell.state === 'focused'"
                                ></button>
                            </td>
                        }
                    </tr>
                }
            </table>
        </div>
    `,
    styles: `
        :host {
            td {
                vertical-align: top;
                width: 50px;
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-top-l layout-margin-bottom-l layout-column',
        'data-testid': 'e2eIconStateAndStyle'
    }
})
export class E2eIconStateAndStyle {
    protected readonly colors: KbqComponentColors[] = Array.from(
        new Set(Object.values(KbqComponentColors)).values()
    ).filter((color) => color !== KbqComponentColors.ThemeFade);

    iconStates: IconStates[][] = [
        this.colors.map((color) => ({ color }))
    ];

    iconItemStates: IconItemStates[][] = [
        this.colors.map((color) => ({ color })),

        this.colors.map((color) => ({
            color,
            state: 'big'
        })),

        this.colors.map((color) => ({
            color,
            state: 'fade'
        }))
    ];

    iconButtonStates: IconButtonStates[][] = [
        this.colors.map((color) => ({
            color,
            state: 'hover'
        })),

        this.colors.map((color) => ({
            color,
            state: 'small'
        })),

        this.colors.map((color) => ({
            color,
            state: 'disabled'
        })),

        this.colors.map((color) => ({
            color,
            state: 'focused'
        }))
    ];
}

@Component({
    selector: 'e2e-icon-svg',
    imports: [
        KbqIconModule,
        KbqTagsModule,
        KbqButtonModule,
        KbqSplitButtonModule,
        KbqDropdownModule,
        KbqFileUploadModule,
        KbqLinkModule,
        KbqFormFieldModule,
        KbqInputModule,
        FormsModule,
        KbqNavbarModule,
        KbqTabsModule
    ],
    template: `
        <table style="max-width: 120px">
            <tr>
                <td><i kbq-icon="kbq-chevron-down-s_16"></i></td>

                <td><i kbq-icon="kbq-arrow-up-from-line_24"></i></td>

                <td><i kbq-icon="kbq-chevron-up_32"></i></td>

                <td><i kbq-icon="kbq-file-pdf-o_48"></i></td>

                <td><i kbq-icon="kbq-play_64"></i></td>
            </tr>
        </table>

        <div class="layout-column layout-gap-xs">
            <div class="layout-row layout-gap-xs">
                <kbq-tag>
                    <i kbq-icon="kbq-circle-check_16"></i>
                    Tag
                    <i kbqTagRemove kbq-icon-button="kbq-xmark-s_16"></i>
                </kbq-tag>
                <kbq-tag>
                    <i kbq-icon="kbq-circle-check_16"></i>
                    Tag
                    <i kbqTagRemove kbq-icon-button="kbq-xmark-s_16"></i>
                </kbq-tag>
            </div>

            <div class="layout-row layout-gap-xs">
                <button kbq-button>
                    <i kbq-icon="kbq-play_16"></i>
                    Button
                </button>
                <button kbq-button>
                    Button
                    <i kbq-icon="kbq-chevron-down-s_16"></i>
                </button>
            </div>

            <div class="layout-row layout-gap-xs">
                <kbq-split-button>
                    <button kbq-button>
                        <i kbq-icon="kbq-play_16"></i>
                        Split button
                    </button>
                    <button kbq-button>
                        <i kbq-icon="kbq-chevron-down-s_16"></i>
                    </button>
                </kbq-split-button>

                <kbq-split-button>
                    <button kbq-button>
                        <i kbq-icon="kbq-play_16"></i>
                        Split button
                    </button>
                    <button kbq-button>
                        <i kbq-icon="kbq-chevron-down-s_16"></i>
                    </button>
                </kbq-split-button>
            </div>

            <div class="layout-row layout-gap-xs">
                <kbq-multiple-file-upload>
                    <ng-template #kbqFileIcon>
                        <i kbq-icon="kbq-file-o_16"></i>
                    </ng-template>
                </kbq-multiple-file-upload>

                <kbq-multiple-file-upload>
                    <ng-template #kbqFileIcon>
                        <i kbq-icon="kbq-file-o_16"></i>
                    </ng-template>
                </kbq-multiple-file-upload>
            </div>

            <div class="layout-row layout-gap-xs">
                <kbq-file-upload>
                    <i kbq-icon="kbq-file-o_16"></i>
                </kbq-file-upload>
                <kbq-file-upload>
                    <i kbq-icon="kbq-file-o_16"></i>
                </kbq-file-upload>
            </div>

            <div class="layout-row layout-align-start-end">
                <p class="layout-margin-top-3xs layout-margin-bottom-3xs">
                    Text
                    <a kbq-link big>
                        <i kbq-icon="kbq-calendar-o_16"></i>
                        <span class="kbq-link__text">both icons</span>
                        <i kbq-icon="kbq-arrow-right_16"></i>
                    </a>
                    text.
                </p>

                <p class="layout-margin-top-3xs layout-margin-bottom-3xs">
                    Text
                    <a kbq-link>
                        <i kbq-icon="kbq-calendar-o_16"></i>
                        <span class="kbq-link__text">both icons</span>
                        <i kbq-icon="kbq-arrow-right_16"></i>
                    </a>
                    text.
                </p>

                <p class="layout-margin-top-3xs layout-margin-bottom-3xs">
                    Text
                    <a class="kbq-link_external" kbq-link>
                        <span class="kbq-link__text">external with icon</span>
                        <i kbq-icon="kbq-north-east_16"></i>
                    </a>
                    text.
                </p>
            </div>

            <div class="layout-row">
                <div>
                    <kbq-form-field style="width: 200px">
                        <input
                            kbqInputPassword
                            placeholder="kbqInputPassword"
                            [ngModel]="inputMonoValue()"
                            (ngModelChange)="inputMonoValue.set($event)"
                        />

                        <kbq-password-toggle />

                        <kbq-password-hint [min]="8" [max]="15" [rule]="passwordRules.Length">
                            8 - 15 symbols
                        </kbq-password-hint>

                        <kbq-reactive-password-hint [hasError]="true">Min length</kbq-reactive-password-hint>
                    </kbq-form-field>
                </div>

                <div style="height: 80px">
                    <kbq-vertical-navbar class="kbq-hovered">
                        <kbq-navbar-container>
                            <kbq-navbar-item>
                                <i kbq-icon="kbq-diamond_16"></i>
                                <kbq-navbar-title>Issues</kbq-navbar-title>
                            </kbq-navbar-item>
                        </kbq-navbar-container>
                        <kbq-navbar-toggle />
                    </kbq-vertical-navbar>
                </div>

                <div>
                    <kbq-tab-group [(activeTab)]="selectedTabId">
                        @for (tab of tabs; track tab) {
                            <kbq-tab [tabId]="tab.tabId">
                                <ng-template kbq-tab-label>
                                    <i [kbq-icon]="tab.icon"></i>
                                    {{ tab.tabId }}
                                </ng-template>
                                id: {{ selectedTabId }}
                            </kbq-tab>
                        }
                    </kbq-tab-group>

                    <kbq-form-field style="width: 200px">
                        <input kbqInput [ngModel]="inputMonoValue()" (ngModelChange)="inputMonoValue.set($event)" />

                        <kbq-cleaner />
                    </kbq-form-field>
                </div>

                <div>
                    <button kbq-button data-testid="e2eIconSvgDropdownTrigger" [kbqDropdownTriggerFor]="dropdown">
                        Dropdown
                        <i kbq-icon="kbq-chevron-down-s_16"></i>
                    </button>

                    <kbq-dropdown #dropdown="kbqDropdown">
                        <button kbq-dropdown-item>
                            <i kbq-icon="kbq-circle-check_16"></i>
                            Item with icon
                        </button>
                    </kbq-dropdown>
                </div>
            </div>
        </div>
    `,
    styles: `
        :host {
            height: 570px;
            max-width: 660px;
        }
    `,
    providers: [
        KbqIconRegistry,
        kbqIconsResolverProvider((name) => `/assets/SVGIcons/${name.replace(/^kbq-/, '')}.svg`)
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-top-l layout-margin-bottom-l layout-column',
        'data-testid': 'e2eIconSvg'
    }
})
export class E2eIconSvg {
    inputMonoValue = signal('P@a$$w0rd');
    protected readonly passwordRules = PasswordRules;

    readonly tabs = [
        { tabId: 'files', icon: 'kbq-folder-open_16' },
        { tabId: 'settings', icon: 'kbq-gear_16' },
        { tabId: 'tasks', icon: 'kbq-bars-horizontal_16' }
    ];

    selectedTabId: string = 'settings';
}
