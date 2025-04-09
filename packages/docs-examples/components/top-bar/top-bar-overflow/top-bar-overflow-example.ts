import { BreakpointObserver } from '@angular/cdk/layout';
import { CdkScrollable } from '@angular/cdk/overlay';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    inject,
    signal,
    ViewChild,
    WritableSignal
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
import { KbqDlModule } from '@koobiq/components/dl';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqOverflowItemsModule } from '@koobiq/components/overflow-items';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { KbqTopBarModule } from '@koobiq/components/top-bar';
import { auditTime, map } from 'rxjs/operators';

type ExampleAction = {
    id: string;
    icon?: string;
    text?: string;
    action?: () => void;
    style: KbqButtonStyles | string;
    color: KbqComponentColors;
};

/**
 * @title TopBar Overflow
 */
@Component({
    standalone: true,
    selector: 'top-bar-overflow-example',
    imports: [
        CdkScrollable,
        KbqTopBarModule,
        KbqButtonModule,
        KbqToolTipModule,
        KbqIconModule,
        KbqDlModule,
        KbqBadgeModule,
        KbqDropdownModule,
        KbqOverflowItemsModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <kbq-top-bar [withShadow]="hasOverflow()">
            <div class="layout-align-center-center" kbqTopBarContainer placement="start">
                <div class="kbq-title example-kbq-top-bar__title">
                    <span class="kbq-truncate-line layout-margin-right-xs">Page</span>

                    <span class="example-kbq-top-bar__counter">13 294</span>
                </div>
            </div>
            <div kbqTopBarSpacer></div>
            <div #kbqOverflowItems="kbqOverflowItems" kbqOverflowItems kbqTopBarContainer placement="end">
                @for (action of actions; track action.id) {
                    <button
                        [kbqOverflowItem]="action.id"
                        [kbqStyle]="action.style"
                        [color]="action.color"
                        [kbqPlacement]="PopUpPlacements.Bottom"
                        [kbqTooltipArrow]="false"
                        [kbqTooltipDisabled]="isDesktop()"
                        [kbqTooltip]="action.text || action.id"
                        kbq-button
                    >
                        @if (action.icon) {
                            <i [class]="action.icon" kbq-icon=""></i>
                        }
                        @if ((action.text && isDesktop()) || (!action.icon && action.text)) {
                            {{ action.text }}
                        }
                    </button>
                }

                <div kbqOverflowItemsResult>
                    <button
                        [kbqStyle]="KbqButtonStyles.Transparent"
                        [color]="KbqComponentColors.Contrast"
                        [kbqDropdownTriggerFor]="appDropdown"
                        kbq-button
                    >
                        <i kbq-icon="kbq-ellipsis-horizontal_16"></i>
                    </button>

                    <kbq-dropdown #appDropdown="kbqDropdown">
                        @for (action of actions; track action.id) {
                            @if (kbqOverflowItems.hiddenItemIDs().has(action.id)) {
                                <button kbq-dropdown-item>
                                    {{ action.text || action.id }}
                                </button>
                            }
                        }
                    </kbq-dropdown>
                </div>
            </div>
        </kbq-top-bar>
        <div class="overflow-content-example kbq-scrollbar" cdkScrollable>
            <div style="height: 600px">
                <kbq-dl>
                    <kbq-dt>Описание</kbq-dt>
                    <kbq-dd>
                        В НАСА описывают случай, когда человек случайно оказался в пространстве, близком к вакууму
                        (давление ниже 1 Па) из-за утечки воздуха из скафандра.
                    </kbq-dd>

                    <kbq-dt>Статус</kbq-dt>
                    <kbq-dd><kbq-badge>Значок</kbq-badge></kbq-dd>

                    <kbq-dt>Дополнительно</kbq-dt>
                    <kbq-dd>
                        Космос — это бескрайнее пространство, полное загадок и чудес. Он начинается за пределами нашей
                        атмосферы и простирается до самых дальних уголков Вселенной. В космосе находятся миллиарды
                        звезд, планет и галактик, каждая из которых имеет свою уникальную историю и характеристики.
                        Исследование космоса помогает нам лучше понять не только саму Вселенную, но и наше место в ней.
                        <br />
                        <br />
                        Одним из самых захватывающих аспектов космоса является его бесконечность. Ученые до сих пор не
                        могут точно определить, где заканчивается Вселенная. Существуют теории о том, что она может быть
                        бесконечной или же иметь определенные границы. Это открывает множество вопросов о том, что
                        находится за пределами видимого космоса и какие формы жизни могут существовать на других
                        планетах. Космические исследования также играют важную роль в развитии технологий на Земле.
                        Многие изобретения, которые мы используем в повседневной жизни, были разработаны благодаря
                        космическим программам. Например, спутниковая навигация, системы связи и даже некоторые
                        медицинские технологии имеют свои корни в космических исследованиях. Это показывает, как
                        изучение космоса может приносить пользу человечеству в целом. Наконец, космос вдохновляет людей
                        на творчество и мечты. С детства мы смотрим на звезды и задаемся вопросами о том, что может быть
                        за пределами нашей планеты. Фильмы, книги и искусство часто черпают вдохновение из космоса,
                        создавая образы, которые захватывают воображение. Это стремление к исследованию и открытию
                        нового делает космос не только научной, но и культурной частью нашей жизни.
                    </kbq-dd>
                </kbq-dl>
            </div>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            height: 400px;
            border-radius: var(--kbq-size-border-radius);
            border: 1px solid var(--kbq-line-contrast-less);
            background: var(--kbq-background-bg);

            .kbq-top-bar {
                border-radius: var(--kbq-size-border-radius) var(--kbq-size-border-radius) 0 0;
            }

            .kbq-overflow-items {
                max-width: 291px;
            }
        }

        .overflow-content-example {
            height: 100%;
            overflow-y: auto;
            scroll-behavior: smooth;
            padding: 0 var(--kbq-size-xxl);
        }

        .example-kbq-top-bar__counter {
            color: var(--kbq-foreground-contrast-tertiary);
            flex: 1;
        }

        .example-kbq-top-bar__title {
            display: inline-flex;
            white-space: nowrap;
        }
    `
})
export class TopBarOverflowExample implements AfterViewInit {
    readonly isDesktop = toSignal(
        inject(BreakpointObserver)
            .observe('(min-width: 768px)')
            .pipe(
                takeUntilDestroyed(),
                map(({ matches }) => matches)
            ),
        { initialValue: true }
    );

    @ViewChild(CdkScrollable) protected readonly scrollable: CdkScrollable;

    readonly hasOverflow: WritableSignal<boolean | undefined> = signal(false);

    readonly actions: ExampleAction[] = [
        {
            id: 'search',
            icon: 'kbq-magnifying-glass_16',
            color: KbqComponentColors.Contrast,
            style: KbqButtonStyles.Transparent
        },
        { id: 'list', icon: 'kbq-list_16', color: KbqComponentColors.Contrast, style: KbqButtonStyles.Transparent },
        { id: 'filter', icon: 'kbq-filter_16', color: KbqComponentColors.Contrast, style: KbqButtonStyles.Transparent },
        { id: 'button1', text: 'Add object', color: KbqComponentColors.Contrast, style: '' },
        { id: 'button2', text: 'Button', color: KbqComponentColors.ContrastFade, style: '' }
    ];

    protected readonly PopUpPlacements = PopUpPlacements;
    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;

    ngAfterViewInit() {
        this.scrollable
            .elementScrolled()
            .pipe(auditTime(300))
            .subscribe(() => this.hasOverflow.set(this.scrollable.measureScrollOffset('top') > 0));
    }
}
