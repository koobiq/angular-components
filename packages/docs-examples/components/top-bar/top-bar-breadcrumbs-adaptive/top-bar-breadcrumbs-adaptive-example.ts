import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { kbqBreadcrumbsConfigurationProvider, KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqOverflowItemsModule } from '@koobiq/components/overflow-items';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { KbqTopBarModule } from '@koobiq/components/top-bar';
import { map } from 'rxjs/operators';

@Component({
    standalone: true,
    selector: 'example-top-bar-breadcrumbs',
    providers: [kbqBreadcrumbsConfigurationProvider({ firstItemNegativeMargin: false })],
    imports: [
        KbqTopBarModule,
        KbqButtonModule,
        KbqToolTipModule,
        KbqIconModule,
        KbqDropdownModule,
        KbqOverflowItemsModule,
        KbqBreadcrumbsModule,
        RouterLink
    ],
    template: `
        <kbq-top-bar withShadow>
            <div class="layout-align-center-center" kbqTopBarContainer placement="start">
                <div class="layout-row layout-margin-right-m flex-none">
                    <img alt="example icon" src="assets/example-icon.svg" width="24" height="24" />
                </div>
                <nav kbq-breadcrumbs size="big">
                    <kbq-breadcrumb-item text="Main" routerLink="./main" />
                    <kbq-breadcrumb-item text="Section" routerLink="./main/sections" />
                    <kbq-breadcrumb-item routerLink="./main/sections/details" text="Details">
                        <a
                            class="kbq-truncate-line"
                            *kbqBreadcrumbView
                            routerLink="./main/sections/page/details"
                            tabindex="-1"
                        >
                            <button disabled aria-current="page" kbq-button kbqBreadcrumb>
                                <span>Details</span>
                                <i kbq-icon="kbq-info-circle_16"></i>
                            </button>
                        </a>
                    </kbq-breadcrumb-item>
                </nav>
            </div>
            <div kbqTopBarSpacer></div>
            <div
                #kbqOverflowItems="kbqOverflowItems"
                [debounceTime]="0"
                kbqOverflowItems
                kbqTopBarContainer
                placement="end"
            >
                <button
                    [kbqStyle]="KbqButtonStyles.Transparent"
                    [color]="KbqComponentColors.Contrast"
                    [kbqPlacement]="PopUpPlacements.Bottom"
                    [kbqTooltipArrow]="false"
                    kbqOverflowItem="filter"
                    kbqTooltip="Filter"
                    kbq-button
                >
                    <i kbq-icon="kbq-filter_16"></i>
                </button>

                <button
                    [kbqStyle]="KbqButtonStyles.Filled"
                    [color]="KbqComponentColors.ContrastFade"
                    [kbqTooltipDisabled]="isDesktop()"
                    [kbqPlacement]="PopUpPlacements.Bottom"
                    [kbqTooltipArrow]="false"
                    kbqOverflowItem="share"
                    kbqTooltip="Share"
                    kbq-button
                >
                    @if (isDesktop()) {
                        Share
                    } @else {
                        <i kbq-icon="kbq-arrow-up-from-rectangle_16"></i>
                    }
                </button>

                <div kbqOverflowItemsResult>
                    <button
                        [kbqStyle]="KbqButtonStyles.Transparent"
                        [color]="KbqComponentColors.Contrast"
                        [kbqDropdownTriggerFor]="appDropdown"
                        kbq-button
                    >
                        <i kbq-icon="kbq-ellipsis-horizontal_16"></i>
                    </button>

                    <kbq-dropdown #appDropdown="kbqDropdown">
                        @if (kbqOverflowItems.hiddenItemIDs().has('filter')) {
                            <button kbq-dropdown-item>Filter</button>
                        }
                        @if (kbqOverflowItems.hiddenItemIDs().has('share')) {
                            <button kbq-dropdown-item>Share</button>
                        }
                    </kbq-dropdown>
                </div>
            </div>
        </kbq-top-bar>
    `,
    styles: `
        :host {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 72px;
            max-width: 100%;
            min-width: 110px;
            container-type: inline-size;

            .kbq-top-bar {
                width: 100%;
            }

            .kbq-top-bar-container__start {
                min-width: 125px;
                --kbq-top-bar-container-start-basis: 125px;
            }
        }

        .example-kbq-top-bar__title {
            display: inline-flex;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleTopBarBreadcrumbs {
    readonly isDesktop = toSignal(
        inject(BreakpointObserver)
            .observe('(min-width: 900px)')
            .pipe(
                takeUntilDestroyed(),
                map(({ matches }) => matches)
            ),
        { initialValue: true }
    );

    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;
    protected readonly PopUpPlacements = PopUpPlacements;
}

/**
 * @title Top Bar Breadcrumbs Adaptive
 */
@Component({
    standalone: true,
    imports: [ExampleTopBarBreadcrumbs],
    selector: 'top-bar-breadcrumbs-adaptive-example',
    template: `
        <div class="layout-margin-bottom-l">
            The automatic breadcrumb shortening is used as the basis, where middle items are hidden when there is not
            enough free space.
        </div>
        <example-top-bar-breadcrumbs />

        <div class="layout-margin-top-3xl layout-margin-bottom-l">
            If the space becomes even narrower, the leftmost breadcrumb level is also hidden, leaving only the rightmost
            level visible.
        </div>
        <example-top-bar-breadcrumbs [style.width.px]="500" />

        <div class="layout-margin-top-3xl layout-margin-bottom-l">
            The minimum width of the left side depends on the title of the current item, which can be truncated to 3
            characters with an ellipsis (…).
        </div>
        <example-top-bar-breadcrumbs [style.width.px]="400" />

        <div class="layout-margin-top-3xl layout-margin-bottom-l">
            After reaching the minimum width on the left side, the compression of the right side with actions can begin.
        </div>
        <example-top-bar-breadcrumbs [style.width.px]="300" />
    `,
    styles: `
        div {
            color: var(--kbq-foreground-contrast-secondary);
            margin: var(--kbq-size-s) var(--kbq-size-s) 0;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopBarBreadcrumbsAdaptiveExample {}
