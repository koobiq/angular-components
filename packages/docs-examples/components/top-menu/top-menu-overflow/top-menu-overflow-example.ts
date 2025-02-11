import { BreakpointObserver } from '@angular/cdk/layout';
import { CdkScrollable } from '@angular/cdk/overlay';
import { AsyncPipe } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, inject, ViewChild } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { KbqTopMenuModule } from '@koobiq/components/top-menu';
import { Observable } from 'rxjs';
import { auditTime, map } from 'rxjs/operators';

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
        KbqTooltipTrigger,
        CdkScrollable
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        @let isDesktopMatches = !!(isDesktop | async)?.matches;
        <kbq-top-menu [hasOverflow]="hasOverflow | async">
            <div class="kbq-top-menu-container__left layout-row layout-align-center-center">
                <div class="layout-row layout-padding-m flex-none">
                    <i class="layout-row flex" kbq-icon="kbq-dashboard_16"></i>
                </div>
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
        <div class="overflow-content kbq-scrollbar" cdkScrollable>
            <div style="height: 600px">Scroll down ⬇️ to see box-shadow</div>
        </div>
    `,
    styles: `
        .kbq-text-ellipsis {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        :host {
            display: flex;
            flex-direction: column;
            height: 400px;
        }

        .overflow-content {
            height: 100%;
            overflow-y: auto;
            scroll-behavior: smooth;
            border: 1px solid var(--kbq-line-contrast-less);
            border-top: 0;
            border-radius: 0 0 var(--kbq-size-border-radius) var(--kbq-size-border-radius);
        }
    `
})
export class TopMenuOverflowExample implements AfterViewInit {
    @ViewChild(CdkScrollable) scrollable: CdkScrollable;

    hasOverflow: Observable<boolean>;

    readonly actions = [
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

    protected readonly isDesktop = inject(BreakpointObserver).observe('(min-width: 768px)');
    protected readonly PopUpPlacements = PopUpPlacements;
    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;

    ngAfterViewInit() {
        this.hasOverflow = this.scrollable.elementScrolled().pipe(
            auditTime(300),
            map(() => this.scrollable.measureScrollOffset('top') > 0)
        );
    }
}
