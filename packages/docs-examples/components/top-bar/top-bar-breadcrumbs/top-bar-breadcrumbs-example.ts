import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { KbqTopBarModule } from '@koobiq/components/top-bar';
import { map } from 'rxjs/operators';

/**
 * @title TopBar Breadcrumbs
 */
@Component({
    standalone: true,
    selector: 'top-bar-breadcrumbs-example',
    imports: [
        RouterLink,
        KbqTopBarModule,
        KbqButtonModule,
        KbqToolTipModule,
        KbqIconModule,
        KbqBreadcrumbsModule,
        KbqDropdownModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <kbq-top-bar>
            <div class="layout-align-start-center" kbqTopBarContainer placement="start">
                <div class="layout-row layout-margin-right-m flex-none">
                    <img alt="example icon" src="assets/example-icon.svg" width="24" height="24" />
                </div>
                <div class="example-top-bar__breadcrumbs flex">
                    <nav kbq-breadcrumbs size="big">
                        <kbq-breadcrumb-item text="Dashboards" routerLink="./dashboards" />
                        <kbq-breadcrumb-item text="MEIS Dashboard" routerLink="./dashboards/dashboard123" />
                    </nav>
                </div>
            </div>
            <div kbqTopBarSpacer></div>
            <div kbqTopBarContainer placement="end">
                <button
                    [kbqStyle]="KbqButtonStyles.Transparent"
                    [color]="KbqComponentColors.Contrast"
                    [kbqPlacement]="PopUpPlacements.Bottom"
                    [kbqTooltipArrow]="false"
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
                    kbqTooltip="Share"
                    kbq-button
                >
                    @if (isDesktop()) {
                        Share
                    } @else {
                        <i kbq-icon="kbq-arrow-up-from-rectangle_16"></i>
                    }
                </button>

                <button
                    [kbqStyle]="KbqButtonStyles.Transparent"
                    [color]="KbqComponentColors.Contrast"
                    [kbqDropdownTriggerFor]="appDropdown"
                    kbq-button
                >
                    <i kbq-icon="kbq-ellipsis-horizontal_16"></i>
                </button>

                <kbq-dropdown #appDropdown="kbqDropdown">
                    <button kbq-dropdown-item>Secondary Action</button>
                </kbq-dropdown>
            </div>
        </kbq-top-bar>
    `
})
export class TopBarBreadcrumbsExample {
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
