import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbItem, KbqBreadcrumbs } from '@koobiq/components/breadcrumbs';
import { KbqButton, KbqButtonCssStyler, KbqButtonDropdownTrigger, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, KbqDecimalPipe, PopUpPlacements } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqOverflowItemsModule } from '@koobiq/components/overflow-items';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { KbqTopBar, KbqTopBarContainer, KbqTopBarSpacer } from './top-bar';

@Component({
    selector: 'e2e-top-bar-states',
    imports: [
        KbqTopBarContainer,
        KbqTopBar,
        KbqTopBarSpacer,
        KbqButton,
        KbqButtonCssStyler,
        KbqDecimalPipe,
        KbqButtonDropdownTrigger,
        KbqDropdownModule,
        KbqIcon,
        KbqOverflowItemsModule,
        KbqBreadcrumbItem,
        KbqBreadcrumbs,
        KbqTooltipTrigger,
        RouterLink
    ],
    template: `
        <div>
            <kbq-top-bar style="width: 380px">
                <div
                    class="layout-row layout-align-center-center layout-padding-top-3xs layout-padding-bottom-3xs"
                    kbqTopBarContainer
                    placement="start"
                >
                    <div class="kbq-title kbq-truncate-line">Dashboards</div>
                </div>

                <div kbqTopBarSpacer></div>

                <div kbqTopBarContainer placement="end">
                    <div #kbqOverflowItems="kbqOverflowItems" kbqOverflowItems>
                        @for (action of actions; track action.id) {
                            <button
                                kbq-button
                                [kbqOverflowItem]="action.id"
                                [kbqStyle]="action.style"
                                [color]="action.color"
                            >
                                {{ action.text }}
                            </button>
                        }

                        <div kbqOverflowItemsResult>
                            <button
                                kbq-button
                                [kbqStyle]="buttonStyles.Transparent"
                                [color]="componentColors.Contrast"
                                [kbqDropdownTriggerFor]="appDropdown"
                            >
                                <i kbq-icon="kbq-ellipsis-horizontal_16"></i>
                            </button>

                            <kbq-dropdown #appDropdown="kbqDropdown">
                                @for (action of actions; track action.id) {
                                    @if (kbqOverflowItems.hiddenItemIDs().has(action.id)) {
                                        <button kbq-dropdown-item>
                                            {{ action.text || action.id }}
                                        </button>
                                    }
                                }
                            </kbq-dropdown>
                        </div>
                    </div>
                </div>
            </kbq-top-bar>
        </div>

        <div style="width: 550px">
            <kbq-top-bar>
                <div
                    class="layout-row layout-align-center-center layout-padding-top-3xs layout-padding-bottom-3xs"
                    kbqTopBarContainer
                    placement="start"
                >
                    <div class="kbq-title kbq-truncate-line example-kbq-top-bar__title">
                        <span class="kbq-truncate-line layout-margin-right-xs">Dashboards</span>

                        <span class="example-kbq-top-bar__counter">{{ 13294 | kbqNumber: '' : 'en-US' }}</span>
                    </div>
                </div>

                <div kbqTopBarSpacer></div>

                <div kbqTopBarContainer placement="end">
                    <div #kbqOverflowItems="kbqOverflowItems" kbqOverflowItems>
                        @for (action of actions; track action.id) {
                            <button
                                kbq-button
                                [kbqOverflowItem]="action.id"
                                [kbqStyle]="action.style"
                                [color]="action.color"
                            >
                                {{ action.text }}
                            </button>
                        }

                        <div kbqOverflowItemsResult>
                            <button
                                kbq-button
                                [kbqStyle]="buttonStyles.Transparent"
                                [color]="componentColors.Contrast"
                                [kbqDropdownTriggerFor]="appDropdown"
                            >
                                <i kbq-icon="kbq-ellipsis-horizontal_16"></i>
                            </button>

                            <kbq-dropdown #appDropdown="kbqDropdown">
                                @for (action of actions; track action.id) {
                                    @if (kbqOverflowItems.hiddenItemIDs().has(action.id)) {
                                        <button kbq-dropdown-item>
                                            {{ action.text || action.id }}
                                        </button>
                                    }
                                }
                            </kbq-dropdown>
                        </div>
                    </div>
                </div>
            </kbq-top-bar>
        </div>

        <div>
            <kbq-top-bar>
                <div class="layout-align-center-center" kbqTopBarContainer placement="start">
                    <nav class="flex" kbq-breadcrumbs size="big" [firstItemNegativeMargin]="false">
                        <kbq-breadcrumb-item text="Dashboards" routerLink="./dashboards" />
                        <kbq-breadcrumb-item text="MEIS Dashboard" routerLink="./dashboards/dashboard123" />
                    </nav>
                </div>
                <div kbqTopBarSpacer></div>
                <div kbqTopBarContainer placement="end">
                    <div #kbqOverflowItems="kbqOverflowItems" kbqOverflowItems>
                        <button
                            kbqOverflowItem="0"
                            kbqTooltip="Filter"
                            kbq-button
                            [kbqStyle]="buttonStyles.Transparent"
                            [color]="componentColors.Contrast"
                            [kbqPlacement]="placements.Bottom"
                            [kbqTooltipArrow]="false"
                        >
                            <i kbq-icon="kbq-filter_16"></i>
                        </button>

                        <button
                            kbqOverflowItem="1"
                            kbqTooltip="Share"
                            kbq-button
                            [kbqStyle]="buttonStyles.Filled"
                            [color]="componentColors.ContrastFade"
                            [kbqPlacement]="placements.Bottom"
                            [kbqTooltipArrow]="false"
                        >
                            Share
                        </button>

                        <div kbqOverflowItemsResult>
                            <button
                                kbq-button
                                [kbqStyle]="buttonStyles.Transparent"
                                [color]="componentColors.Contrast"
                                [kbqDropdownTriggerFor]="appDropdown"
                            >
                                <i kbq-icon="kbq-ellipsis-horizontal_16"></i>
                            </button>

                            <kbq-dropdown #appDropdown="kbqDropdown">
                                @if (kbqOverflowItems.hiddenItemIDs().has('0')) {
                                    <button kbq-dropdown-item>Filter</button>
                                }
                                @if (kbqOverflowItems.hiddenItemIDs().has('1')) {
                                    <button kbq-dropdown-item>Share</button>
                                }
                            </kbq-dropdown>
                        </div>
                    </div>
                </div>
            </kbq-top-bar>
        </div>

        <div>
            <kbq-top-bar [withShadow]="true">
                <div
                    class="layout-row layout-align-center-center layout-padding-top-3xs layout-padding-bottom-3xs"
                    kbqTopBarContainer
                    placement="start"
                >
                    <div class="kbq-title kbq-truncate-line">Dashboards</div>
                </div>

                <div kbqTopBarSpacer></div>

                <div kbqTopBarContainer placement="end">
                    <div #kbqOverflowItems="kbqOverflowItems" kbqOverflowItems>
                        @for (action of actions; track action.id) {
                            <button
                                kbq-button
                                [kbqOverflowItem]="action.id"
                                [kbqStyle]="action.style"
                                [color]="action.color"
                            >
                                {{ action.text }}
                            </button>
                        }

                        <div kbqOverflowItemsResult>
                            <button
                                kbq-button
                                [kbqStyle]="buttonStyles.Transparent"
                                [color]="componentColors.Contrast"
                                [kbqDropdownTriggerFor]="appDropdown"
                            >
                                <i kbq-icon="kbq-ellipsis-horizontal_16"></i>
                            </button>

                            <kbq-dropdown #appDropdown="kbqDropdown">
                                @for (action of actions; track action.id) {
                                    @if (kbqOverflowItems.hiddenItemIDs().has(action.id)) {
                                        <button kbq-dropdown-item>
                                            {{ action.text || action.id }}
                                        </button>
                                    }
                                }
                            </kbq-dropdown>
                        </div>
                    </div>
                </div>
            </kbq-top-bar>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-m);
            padding: var(--kbq-size-xxs);
            max-width: 800px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eTopbarStates'
    }
})
export class E2eTopBarStates {
    protected readonly actions = [
        {
            id: '1',
            color: KbqComponentColors.Contrast,
            style: KbqButtonStyles.Transparent,
            icon: 'kbq-list_16',
            text: 'List'
        },
        {
            id: '2',
            color: KbqComponentColors.Contrast,
            style: KbqButtonStyles.Transparent,
            icon: 'kbq-filter_16',
            text: 'Filter'
        },
        {
            id: '3',
            color: KbqComponentColors.Contrast,
            style: '',
            icon: 'kbq-plus_16',
            text: 'Create dashboard'
        }
    ];
    protected readonly placements = PopUpPlacements;
    protected readonly buttonStyles = KbqButtonStyles;
    protected readonly componentColors = KbqComponentColors;
}
