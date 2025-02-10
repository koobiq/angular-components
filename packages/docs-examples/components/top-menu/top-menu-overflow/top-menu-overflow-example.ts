import { CdkScrollable } from '@angular/cdk/overlay';
import { AsyncPipe } from '@angular/common';
import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
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
    styleUrls: ['top-menu-overflow-example.css'],
    template: `
        <kbq-top-menu [hasOverflow]="hasOverflow | async">
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
                    kbq-button
                    kbqTooltip="Добавить виджет"
                >
                    <i kbq-icon="kbq-plus_16"></i>
                </button>
                <button [kbqStyle]="KbqButtonStyles.Outline" [color]="KbqComponentColors.ContrastFade" kbq-button>
                    Отмена
                </button>
                <button [color]="KbqComponentColors.Contrast" kbq-button kbqTooltip="Сохранить">
                    <i kbq-icon="kbq-floppy-disk_16"></i>
                    Сохранить
                </button>
            </div>
        </kbq-top-menu>
        <div class="overflow-content" cdkScrollable>
            <div style="height: 600px">Overflow Content</div>
        </div>
    `
})
export class TopMenuOverflowExample implements AfterViewInit {
    @Input() iconVisible: boolean = true;
    @ViewChild(CdkScrollable) scrollable: CdkScrollable;
    hasOverflow: Observable<boolean>;
    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;

    ngAfterViewInit() {
        this.hasOverflow = this.scrollable.elementScrolled().pipe(
            auditTime(300),
            map(() => this.scrollable.measureScrollOffset('top') > 0)
        );
    }
}
