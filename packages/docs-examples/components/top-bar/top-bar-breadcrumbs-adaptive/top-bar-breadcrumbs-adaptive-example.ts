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
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { map } from 'rxjs/operators';
import { ADAPTIVE_TRANSLATIONS, AdaptiveTranslation, ExampleTranslation, TRANSLATIONS } from './l10n';

@Component({
    selector: 'example-top-bar-breadcrumbs',
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
                    <img alt="example icon" src="https://koobiq.io/assets/example-icon.svg" width="24" height="24" />
                </div>
                <nav kbq-breadcrumbs size="big">
                    <kbq-breadcrumb-item text="Main" routerLink="./main" />
                    <kbq-breadcrumb-item text="Section" routerLink="./main/sections" />
                    <kbq-breadcrumb-item routerLink="./main/sections/details" text="Details">
                        <a
                            *kbqBreadcrumbView
                            class="kbq-truncate-line"
                            routerLink="./main/sections/page/details"
                            tabindex="-1"
                        >
                            <button disabled aria-current="page" kbq-button kbqBreadcrumb>
                                <span>{{ t().details }}</span>
                                <i
                                    kbq-icon="kbq-circle-info_16"
                                    kbqTooltip="Info"
                                    [kbqPlacement]="PopUpPlacements.Bottom"
                                    [kbqTooltipArrow]="false"
                                ></i>
                            </button>
                        </a>
                    </kbq-breadcrumb-item>
                </nav>
            </div>
            <div kbqTopBarSpacer></div>
            <div kbqTopBarContainer placement="end">
                <div #kbqOverflowItems="kbqOverflowItems" kbqOverflowItems>
                    <button
                        kbqOverflowItem="filter"
                        kbq-button
                        [kbqTooltip]="t().filter"
                        [attr.aria-label]="t().filter"
                        [kbqStyle]="KbqButtonStyles.Transparent"
                        [color]="KbqComponentColors.Contrast"
                        [kbqPlacement]="PopUpPlacements.Bottom"
                        [kbqTooltipArrow]="false"
                    >
                        <i kbq-icon="kbq-filter_16"></i>
                    </button>

                    <button
                        kbqOverflowItem="share"
                        kbq-button
                        [kbqTooltip]="t().share"
                        [kbqStyle]="KbqButtonStyles.Filled"
                        [color]="KbqComponentColors.ContrastFade"
                        [kbqTooltipDisabled]="isDesktop()"
                        [kbqPlacement]="PopUpPlacements.Bottom"
                        [kbqTooltipArrow]="false"
                    >
                        @if (isDesktop()) {
                            Share
                        } @else {
                            <i kbq-icon="kbq-arrow-up-from-rectangle_16"></i>
                        }
                    </button>

                    <div kbqOverflowItemsResult>
                        <button
                            kbq-button
                            aria-label="More"
                            [kbqStyle]="KbqButtonStyles.Transparent"
                            [color]="KbqComponentColors.Contrast"
                            [kbqDropdownTriggerFor]="appDropdown"
                        >
                            <i kbq-icon="kbq-ellipsis-horizontal_16"></i>
                        </button>

                        <kbq-dropdown #appDropdown="kbqDropdown">
                            @if (kbqOverflowItems.hiddenItemIDs().has('filter')) {
                                <button kbq-dropdown-item>{{ t().filter }}</button>
                            }
                            @if (kbqOverflowItems.hiddenItemIDs().has('share')) {
                                <button kbq-dropdown-item>{{ t().share }}</button>
                            }
                        </kbq-dropdown>
                    </div>
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

            .kbq-top-bar-container_start {
                --kbq-top-bar-container-start-min-width: 180px;
            }
        }

        .example-kbq-top-bar__title {
            display: inline-flex;
        }
    `,
    providers: [kbqBreadcrumbsConfigurationProvider({ firstItemNegativeMargin: false })],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleTopBarBreadcrumbs extends BaseLocalizedExample<ExampleTranslation> {
    constructor() {
        super(TRANSLATIONS);
    }

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
    selector: 'top-bar-breadcrumbs-adaptive-example',
    imports: [ExampleTopBarBreadcrumbs],
    template: `
        <div class="layout-margin-bottom-l">
            {{ t().breadcrumbShortening }}
        </div>
        <example-top-bar-breadcrumbs />

        <div class="layout-margin-top-3xl layout-margin-bottom-l">
            {{ t().leftmostHidden }}
        </div>
        <example-top-bar-breadcrumbs [style.width.px]="500" />

        <div class="layout-margin-top-3xl layout-margin-bottom-l">
            {{ t().currentItemTruncation }}
        </div>
        <example-top-bar-breadcrumbs [style.width.px]="400" />

        <div class="layout-margin-top-3xl layout-margin-bottom-l">
            {{ t().rightSideCompression }}
        </div>
        <example-top-bar-breadcrumbs [style.width.px]="342" />
    `,
    styles: `
        div {
            color: var(--kbq-foreground-contrast-secondary);
            margin: var(--kbq-size-s) var(--kbq-size-s) 0;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopBarBreadcrumbsAdaptiveExample extends BaseLocalizedExample<AdaptiveTranslation> {
    constructor() {
        super(ADAPTIVE_TRANSLATIONS);
    }
}
