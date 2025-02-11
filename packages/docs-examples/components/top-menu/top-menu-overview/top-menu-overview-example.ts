import { BreakpointObserver } from '@angular/cdk/layout';
import { CdkScrollable } from '@angular/cdk/overlay';
import { AsyncPipe } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { KbqTopMenuModule } from '@koobiq/components/top-menu';

/**
 * @title TopMenu
 */
@Component({
    standalone: true,
    selector: 'top-menu-overview-example',
    imports: [
        KbqTopMenuModule,
        KbqButtonModule,
        KbqToolTipModule,
        KbqIcon,
        AsyncPipe,
        KbqTooltipTrigger,
        CdkScrollable
    ],
    styleUrls: ['top-menu-overview-example.css'],
    template: `
        @let isDesktopMatches = !!(isDesktop | async)?.matches;
        <kbq-top-menu>
            <div class="kbq-top-menu-container__left layout-row layout-align-center-center">
                @if (iconVisible) {
                    <i class="layout-row layout-padding-m" kbq-icon="kbq-dashboard_16"></i>
                }
                <div class="kbq-title kbq-text-ellipsis">Дашборд</div>
            </div>
            <div class="kbq-top-menu__spacer"></div>
            <div class="kbq-top-menu-container__right layout-row">
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
        </kbq-top-menu>
    `
})
export class TopMenuOverviewExample {
    @Input() iconVisible: boolean = true;

    isDesktop = inject(BreakpointObserver).observe('(min-width: 900px)');

    actions = [
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
