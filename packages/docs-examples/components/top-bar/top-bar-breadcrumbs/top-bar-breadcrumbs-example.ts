import { BreakpointObserver } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
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
        AsyncPipe,
        RouterLink,
        KbqTopBarModule,
        KbqButtonModule,
        KbqToolTipModule,
        KbqIconModule,
        KbqBreadcrumbsModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <kbq-top-bar>
            <div class="layout-align-center-center" kbqTopBarContainer placement="start">
                <div class="layout-row layout-padding-m flex-none">
                    <i class="layout-row flex" kbq-icon="kbq-dashboard_16"></i>
                </div>
                <div class="kbq-top-bar__breadcrumbs">
                    <nav [max]="3" kbq-breadcrumbs>
                        <kbq-breadcrumb-item text="Dashboards" routerLink="./dashboards" />
                        <kbq-breadcrumb-item text="MEIS Dashboard" routerLink="./dashboards/dashboard123" />
                        <kbq-breadcrumb-item text="Widgets" routerLink="./dashboards/dashboard123/widgets" />
                        <kbq-breadcrumb-item
                            text="widget123"
                            routerLink="./dashboards/dashboard123/widgets/widget123"
                        />
                    </nav>
                </div>
            </div>
            <div kbqTopBarSpacer></div>
            <div kbqTopBarContainer placement="end">
                @for (action of actions; track $index) {
                    <button
                        [kbqStyle]="action.style"
                        [color]="action.color"
                        [kbqTooltipDisabled]="isDesktop()"
                        [kbqPlacement]="PopUpPlacements.Bottom"
                        [kbqTooltip]="action.title"
                        [disabled]="action.disabled"
                        kbq-button
                    >
                        @if (!isDesktop() && action.icon) {
                            <i [class]="action.icon" kbq-icon=""></i>
                        }
                        @if (isDesktop()) {
                            {{ action.title }}
                        }
                    </button>
                }
            </div>
        </kbq-top-bar>
    `
})
export class TopBarBreadcrumbsExample {
    isDesktop = toSignal(
        inject(BreakpointObserver)
            .observe('(min-width: 900px)')
            .pipe(
                takeUntilDestroyed(),
                map(({ matches }) => matches)
            ),
        { initialValue: true }
    );

    readonly actions = [
        {
            title: 'Add widget',
            style: KbqButtonStyles.Transparent,
            color: KbqComponentColors.Contrast,
            icon: 'kbq-plus_16'
        },
        {
            title: 'Cancel',
            style: KbqButtonStyles.Outline,
            color: KbqComponentColors.ContrastFade,
            icon: 'kbq-undo_16'
        },
        {
            title: 'Save',
            style: '',
            color: KbqComponentColors.Contrast,
            icon: 'kbq-floppy-disk_16',
            disabled: true
        }
    ];

    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;
    protected readonly PopUpPlacements = PopUpPlacements;
}
