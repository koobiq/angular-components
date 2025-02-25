import { BreakpointObserver } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { KbqTopBarModule } from '@koobiq/components/top-bar';
import { map, startWith } from 'rxjs/operators';

/**
 * @title TopBar
 */
@Component({
    standalone: true,
    selector: 'top-bar-overview-example',
    imports: [
        AsyncPipe,
        KbqTopBarModule,
        KbqButtonModule,
        KbqToolTipModule,
        KbqIconModule
    ],
    template: `
        @let isDesktopMatches = !!(isDesktop | async);
        <kbq-top-bar>
            <div class="layout-row layout-align-center-center" kbqTopBarContainer placement="start">
                <div class="layout-row layout-padding-m flex-none">
                    <i class="layout-row flex" kbq-icon="kbq-dashboard_16"></i>
                </div>
                <div class="kbq-title kbq-text-ellipsis">Dashboard</div>
            </div>

            <div kbqTopBarSpacer></div>

            <div kbqTopBarContainer placement="end">
                @for (action of actions; track index; let index = $index) {
                    <button
                        [kbqStyle]="action.style || ''"
                        [color]="action.color || ''"
                        [kbqTooltipDisabled]="isDesktopMatches"
                        [kbqPlacement]="PopUpPlacements.Bottom"
                        [kbqTooltip]="action.title"
                        kbq-button
                    >
                        @if (action.icon) {
                            <i [class]="action.icon" kbq-icon=""></i>
                        }
                        @if (isDesktopMatches) {
                            {{ action.title }}
                        }
                    </button>
                }
            </div>
        </kbq-top-bar>
    `,
    styles: `
        .kbq-text-ellipsis {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopBarOverviewExample {
    readonly isDesktop = inject(BreakpointObserver)
        .observe('(min-width: 900px)')
        .pipe(
            startWith({ matches: true }),
            map(({ matches }) => !!matches)
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
            color: KbqComponentColors.Contrast,
            icon: 'kbq-floppy-disk_16'
        }
    ];

    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;
    protected readonly PopUpPlacements = PopUpPlacements;
}
