import { BreakpointObserver } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { KbqTopBarModule } from '@koobiq/components/top-bar';
import { map } from 'rxjs/operators';

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
        <kbq-top-bar>
            <div class="layout-row layout-align-center-center" kbqTopBarContainer placement="start">
                <div class="layout-row layout-padding-m flex-none">
                    <i class="layout-row flex" kbq-icon="kbq-dashboard_16"></i>
                </div>
                <div class="kbq-title kbq-truncate-line">Dashboard</div>
            </div>

            <div kbqTopBarSpacer></div>

            <div kbqTopBarContainer placement="end">
                @for (action of actions; track $index) {
                    <button
                        [kbqStyle]="action.style"
                        [color]="action.color"
                        [kbqTooltipDisabled]="isDesktop"
                        [kbqPlacement]="PopUpPlacements.Bottom"
                        [kbqTooltip]="action.title"
                        kbq-button
                    >
                        @if (action.icon) {
                            <i [class]="action.icon" kbq-icon=""></i>
                        }
                        @if (isDesktop) {
                            {{ action.title }}
                        }
                    </button>
                }
            </div>
        </kbq-top-bar>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopBarOverviewExample {
    isDesktop = true;

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
            icon: 'kbq-floppy-disk_16'
        }
    ];

    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;
    protected readonly PopUpPlacements = PopUpPlacements;
    protected readonly cdr = inject(ChangeDetectorRef);

    constructor() {
        inject(BreakpointObserver)
            .observe('(min-width: 900px)')
            .pipe(
                map(({ matches }) => matches),
                takeUntilDestroyed()
            )
            .subscribe((matches) => {
                this.isDesktop = matches;
                this.cdr.markForCheck();
            });
    }
}
