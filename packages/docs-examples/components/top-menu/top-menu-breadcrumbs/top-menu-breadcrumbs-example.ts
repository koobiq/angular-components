import { BreakpointObserver } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { KbqTopMenuModule } from '@koobiq/components/top-menu';
import { map, startWith } from 'rxjs/operators';

/**
 * @title TopMenu Breadcrumbs
 */
@Component({
    standalone: true,
    selector: 'top-menu-breadcrumbs-example',
    imports: [
        AsyncPipe,
        RouterLink,
        KbqTopMenuModule,
        KbqButtonModule,
        KbqToolTipModule,
        KbqIconModule,
        KbqBreadcrumbsModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        @let isDesktopMatches = !!(isDesktop | async);
        <kbq-top-menu>
            <div class="layout-align-center-center" kbqTopMenuContainer placement="left">
                <div class="layout-row layout-padding-m flex-none">
                    <i class="layout-row flex" kbq-icon="kbq-dashboard_16"></i>
                </div>
                <div class="kbq-top-menu__breadcrumbs">
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
            <div kbqTopMenuSpacer></div>
            <div kbqTopMenuContainer placement="right">
                @for (action of actions; track index; let index = $index) {
                    <button
                        [kbqStyle]="action.style || ''"
                        [color]="action.color || ''"
                        [kbqTooltipDisabled]="isDesktopMatches"
                        [kbqPlacement]="PopUpPlacements.Bottom"
                        [kbqTooltip]="action.title"
                        [disabled]="action.disabled"
                        kbq-button
                    >
                        @if (!isDesktopMatches && action.icon) {
                            <i [class]="action.icon" kbq-icon=""></i>
                        }
                        @if (isDesktopMatches) {
                            {{ action.title }}
                        }
                    </button>
                }
            </div>
        </kbq-top-menu>
    `
})
export class TopMenuBreadcrumbsExample {
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
            color: KbqComponentColors.Contrast,
            icon: 'kbq-floppy-disk_16',
            disabled: true
        }
    ];
    readonly isDesktop = inject(BreakpointObserver)
        .observe('(min-width: 900px)')
        .pipe(
            startWith({ matches: true }),
            map(({ matches }) => !!matches)
        );

    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;
    protected readonly PopUpPlacements = PopUpPlacements;
}
