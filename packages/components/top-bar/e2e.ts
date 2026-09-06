import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbItem, KbqBreadcrumbs } from '@koobiq/components/breadcrumbs';
import {
    KbqButton,
    KbqButtonColor,
    KbqButtonCssStyler,
    KbqButtonDropdownTrigger,
    KbqButtonStyleInput,
    KbqButtonStyles
} from '@koobiq/components/button';
import { KbqComponentColors, KbqDecimalPipe, PopUpPlacements } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqOverflowItemsModule } from '@koobiq/components/overflow-items';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { KbqTopBar, KbqTopBarContainer, KbqTopBarSpacer } from './top-bar';

/** An overflowing action rendered as a button. Annotated so the values keep the button's types. */
type E2eTopBarAction = {
    id: string;
    color: KbqButtonColor;
    style: KbqButtonStyleInput;
    text: string;
};

const ACTIONS: E2eTopBarAction[] = [
    { id: '1', color: KbqComponentColors.Contrast, style: KbqButtonStyles.Transparent, text: 'List' },
    { id: '2', color: KbqComponentColors.Contrast, style: KbqButtonStyles.Transparent, text: 'Filter' },
    { id: '3', color: KbqComponentColors.Contrast, style: '', text: 'Create dashboard' }
];

/**
 * One bar whose end slot holds the overflowing actions, with the start slot projected in. The host is laid
 * out as `display: contents` so wrapping the markup in a component does not change what is rendered.
 */
@Component({
    selector: 'e2e-top-bar-actions-row',
    imports: [
        KbqTopBar,
        KbqTopBarContainer,
        KbqTopBarSpacer,
        KbqButton,
        KbqButtonCssStyler,
        KbqButtonDropdownTrigger,
        KbqDropdownModule,
        KbqIcon,
        KbqOverflowItemsModule
    ],
    template: `
        <kbq-top-bar [style.width.px]="width()" [withShadow]="withShadow()">
            <div
                class="layout-row layout-align-center-center layout-padding-top-3xs layout-padding-bottom-3xs"
                kbqTopBarContainer
                placement="start"
            >
                <ng-content />
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
                            aria-label="More"
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
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        style: 'display: contents'
    }
})
export class E2eTopBarActionsRow {
    readonly withShadow = input(false);
    readonly width = input<number | undefined>(undefined);

    protected readonly actions = ACTIONS;
    protected readonly buttonStyles = KbqButtonStyles;
    protected readonly componentColors = KbqComponentColors;
}

@Component({
    selector: 'e2e-top-bar-states',
    imports: [
        E2eTopBarActionsRow,
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
            <e2e-top-bar-actions-row [withShadow]="true">
                <div class="kbq-title kbq-truncate-line">Dashboards</div>
            </e2e-top-bar-actions-row>
        </div>

        <div>
            <e2e-top-bar-actions-row [width]="380">
                <div class="kbq-title kbq-truncate-line">Dashboards</div>
            </e2e-top-bar-actions-row>
        </div>

        <div style="width: 550px">
            <e2e-top-bar-actions-row>
                <div class="kbq-title kbq-truncate-line example-kbq-top-bar__title">
                    <span class="kbq-truncate-line layout-margin-right-xs">Dashboards</span>

                    <span class="example-kbq-top-bar__counter">{{ 13294 | kbqNumber: '' : 'en-US' }}</span>
                </div>
            </e2e-top-bar-actions-row>
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
                            aria-label="Filter"
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
                                aria-label="More"
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

        <!--
            The overflow-items host one level below the container. Top bar styles only the host it owns, so
            this row must keep the bar's height and space its own buttons instead of losing both.
        -->
        <div data-testid="e2eTopBarNestedOverflowItems">
            <kbq-top-bar>
                <div kbqTopBarContainer placement="start">
                    <div class="kbq-title kbq-truncate-line">Nested</div>
                </div>
                <div kbqTopBarSpacer></div>
                <div kbqTopBarContainer placement="end">
                    <div>
                        <div
                            #kbqOverflowItems="kbqOverflowItems"
                            class="e2e-top-bar__nested-overflow-items"
                            kbqOverflowItems
                        >
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
                                    aria-label="More"
                                    [kbqStyle]="buttonStyles.Transparent"
                                    [color]="componentColors.Contrast"
                                    [kbqDropdownTriggerFor]="nestedDropdown"
                                >
                                    <i kbq-icon="kbq-ellipsis-horizontal_16"></i>
                                </button>

                                <kbq-dropdown #nestedDropdown="kbqDropdown">
                                    @for (action of actions; track action.id) {
                                        @if (kbqOverflowItems.hiddenItemIDs().has(action.id)) {
                                            <button kbq-dropdown-item>{{ action.text }}</button>
                                        }
                                    }
                                </kbq-dropdown>
                            </div>
                        </div>
                    </div>
                </div>
            </kbq-top-bar>
        </div>

        <!-- A title too long for the bar: it truncates down to the start container's floor and no further. -->
        <div data-testid="e2eTopBarStartContainerFloor" style="width: 320px">
            <kbq-top-bar style="--kbq-top-bar-container-start-min-width: 120px">
                <div kbqTopBarContainer placement="start">
                    <div class="kbq-title kbq-truncate-line">A dashboard title far too long for this bar</div>
                </div>
                <div kbqTopBarSpacer></div>
                <div kbqTopBarContainer placement="end">
                    <button kbq-button [color]="componentColors.Contrast">Create</button>
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
            max-width: 550px;
        }

        .e2e-top-bar__nested-overflow-items {
            display: flex;
            gap: var(--kbq-top-bar-container-end-gap);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eTopBarStates'
    }
})
export class E2eTopBarStates {
    protected readonly actions = ACTIONS;
    protected readonly placements = PopUpPlacements;
    protected readonly buttonStyles = KbqButtonStyles;
    protected readonly componentColors = KbqComponentColors;
}

/**
 * A bar stuck to the top of a scrolling page. Guards two things at once: `--kbq-top-bar-inset-block-start`
 * is what makes the default `position: sticky` take effect, and the bar's own layer stays below the CDK
 * overlay container, so a dropdown opened from inside it paints on top of the bar.
 */
@Component({
    selector: 'e2e-top-bar-sticky',
    imports: [
        KbqTopBar,
        KbqTopBarContainer,
        KbqTopBarSpacer,
        KbqButton,
        KbqButtonCssStyler,
        KbqButtonDropdownTrigger,
        KbqDropdownModule
    ],
    template: `
        <div class="e2e-top-bar-sticky__scroller" data-testid="e2eTopBarStickyScroller">
            <kbq-top-bar role="banner" aria-label="Dashboards" [withShadow]="true">
                <div kbqTopBarContainer placement="start">
                    <div class="kbq-title kbq-truncate-line">Dashboards</div>
                </div>

                <div kbqTopBarSpacer></div>

                <div kbqTopBarContainer placement="end">
                    <button
                        kbq-button
                        data-testid="e2eTopBarStickyDropdownTrigger"
                        [color]="componentColors.Contrast"
                        [kbqDropdownTriggerFor]="stickyDropdown"
                    >
                        Actions
                    </button>

                    <kbq-dropdown #stickyDropdown="kbqDropdown">
                        <button kbq-dropdown-item>Rename</button>
                        <button kbq-dropdown-item>Duplicate</button>
                        <button kbq-dropdown-item>Delete</button>
                    </kbq-dropdown>
                </div>
            </kbq-top-bar>

            @for (row of rows; track row) {
                <p class="e2e-top-bar-sticky__row">Row {{ row }}</p>
            }
        </div>
    `,
    styles: `
        :host {
            display: block;
            padding: var(--kbq-size-xxs);
            max-width: 550px;
        }

        .e2e-top-bar-sticky__scroller {
            height: 240px;
            overflow-y: auto;
        }

        .kbq-top-bar {
            --kbq-top-bar-inset-block-start: 0;
        }

        .e2e-top-bar-sticky__row {
            margin: 0;
            padding: var(--kbq-size-m) var(--kbq-size-xxl);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eTopBarSticky'
    }
})
export class E2eTopBarSticky {
    protected readonly rows = Array.from({ length: 12 }, (_, index) => index + 1);
    protected readonly componentColors = KbqComponentColors;
}
