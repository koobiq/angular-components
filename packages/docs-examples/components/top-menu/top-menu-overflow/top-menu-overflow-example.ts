import { BreakpointObserver } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { KbqTopMenuModule } from 'packages/components/top-menu';

/**
 * @title TopMenu Overflow
 */
@Component({
    standalone: true,
    selector: 'top-menu-overflow-example',
    imports: [
        KbqTopMenuModule,
        KbqButtonModule,
        KbqToolTipModule,
        KbqIcon,
        AsyncPipe,
        KbqTooltipTrigger
    ],
    styleUrls: ['./top-menu-overflow-example.css'],
    template: `
        @let isDesktopMatches = isDesktop | async;
        <kbq-top-menu class="kbq-top-menu-overflow">
            <div class="kbq-top-menu-container__left layout-row layout-align-center-center">
                @if (iconVisible) {
                    <i class="layout-row layout-padding-m" kbq-icon="kbq-dashboard_16"></i>
                }
                <div class="kbq-title kbq-text-ellipsis">Дашборд</div>
            </div>
            <div class="kbq-top-menu__spacer"></div>
            <div class="kbq-top-menu-container__right layout-row">
                <button
                    [kbqStyle]="KbqButtonStyles.Transparent"
                    [color]="KbqComponentColors.Contrast"
                    [kbqTooltipDisabled]="!!isDesktopMatches?.matches"
                    kbq-button
                    kbqTooltip="Добавить виджет"
                >
                    <i kbq-icon="kbq-plus_16"></i>
                    @if (isDesktopMatches?.matches) {
                        Добавить виджет
                    }
                </button>
                <button [kbqStyle]="KbqButtonStyles.Outline" [color]="KbqComponentColors.ContrastFade" kbq-button>
                    Отмена
                </button>
                <button
                    [color]="KbqComponentColors.Contrast"
                    [kbqTooltipDisabled]="!!isDesktopMatches?.matches"
                    kbq-button
                    kbqTooltip="Сохранить"
                >
                    <i kbq-icon="kbq-floppy-disk_16"></i>
                    @if (isDesktopMatches?.matches) {
                        Сохранить
                    }
                </button>
            </div>
        </kbq-top-menu>
    `
})
export class TopMenuOverflowExample {
    @Input() iconVisible: boolean = true;
    isDesktop = inject(BreakpointObserver).observe('(min-width: 800px)');
    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;
}
