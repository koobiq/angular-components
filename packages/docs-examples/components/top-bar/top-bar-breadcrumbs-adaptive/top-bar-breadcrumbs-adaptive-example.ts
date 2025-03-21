import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { KbqBreadcrumbsModule } from '@koobiq/components/breadcrumbs';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, PopUpPlacements } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqOverflowItemsModule } from '@koobiq/components/overflow-items';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { KbqTopBarModule } from '@koobiq/components/top-bar';
import { map } from 'rxjs/operators';

type ExampleAction = {
    id: string;
    icon?: string;
    text?: string;
    action?: () => void;
    style: KbqButtonStyles | string;
    color: KbqComponentColors;
};

@Component({
    standalone: true,
    selector: 'example-top-bar-breadcrumbs',
    imports: [
        KbqTopBarModule,
        KbqButtonModule,
        KbqToolTipModule,
        KbqIconModule,
        KbqDropdownModule,
        KbqOverflowItemsModule,
        KbqBreadcrumbsModule,
        RouterLink
    ],
    template: `
        <kbq-top-bar>
            <div class="layout-align-center-center" kbqTopBarContainer placement="start">
                <div class="layout-row layout-margin-right-m flex-none">
                    <i class="layout-row flex" kbq-icon="">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M0 19.2C0 21.3033 0 22.4726 0.763692 23.2363C1.52738 24 2.69665 24 4.8 24H19.2C21.3033 24 22.4726 24 23.2363 23.2363C24 22.4726 24 21.3033 24 19.2V4.8C24 2.69665 24 1.52738 23.2363 0.763692C22.4726 0 21.3033 0 19.2 0H4.8C2.69665 0 1.52738 0 0.763692 0.763692C0 1.52738 0 2.69665 0 4.8V19.2Z"
                                fill="#FF0000"
                            />
                            <path
                                d="M11.233 12L8.39495 14.8381L5.55688 12L8.39495 9.20029L11.233 12ZM14.8381 15.6435L12.0384 18.4432L9.20035 15.6435L12.0384 12.8054L14.8381 15.6435ZM14.8381 8.39489L12.0384 11.1946L9.20035 8.39489L12.0384 5.55682L14.8381 8.39489ZM18.4432 12L15.6435 14.8381L12.8438 12L15.6435 9.20029L18.4432 12Z"
                                fill="white"
                            />
                        </svg>
                    </i>
                </div>
                <div class="kbq-top-bar__breadcrumbs">
                    <nav [max]="isDesktop() ? null : 3" kbq-breadcrumbs size="big">
                        <kbq-breadcrumb-item text="Main" routerLink="./main" />
                        <kbq-breadcrumb-item text="Sections" routerLink="./main/sections" />
                        <kbq-breadcrumb-item text="Page" routerLink="./main/sections/page" />
                        <kbq-breadcrumb-item text="Details" routerLink="./main/sections/page/details" />
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
    `,
    styles: `
        :host {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 72px;
            resize: horizontal;
            max-width: 100%;
            min-width: 110px;
            overflow: hidden;
            container-type: inline-size;

            .kbq-top-bar {
                width: 100%;
            }
        }

        .example-kbq-top-bar__title {
            display: inline-flex;
        }

        .kbq-overflow-items {
            max-width: 210px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleTopBarBreadcrumbs {
    isDesktop = toSignal(
        inject(BreakpointObserver)
            .observe('(min-width: 900px)')
            .pipe(
                takeUntilDestroyed(),
                map(({ matches }) => matches)
            ),
        { initialValue: true }
    );

    readonly actions: ExampleAction[] = [
        { id: 'filter', icon: 'kbq-filter_16', color: KbqComponentColors.Contrast, style: KbqButtonStyles.Transparent },
        { id: 'button1', text: 'Apply', color: KbqComponentColors.Contrast, style: '' },
        { id: 'button2', text: 'Button 2', color: KbqComponentColors.ContrastFade, style: '' }
    ];

    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;
    protected readonly PopUpPlacements = PopUpPlacements;
}

/**
 * @title Top Bar Breadcrumbs Adaptive
 */
@Component({
    standalone: true,
    imports: [ExampleTopBarBreadcrumbs],
    selector: 'top-bar-breadcrumbs-adaptive-example',
    template: `
        <div>
            За основу берется автоматическое сокращение хлебных крошек, когда средние пункты скрываются при отсутствии
            свободного пространства.
        </div>
        <example-top-bar-breadcrumbs [style.width.px]="680" />

        <div>
            Если пространство становится еще уже, то скрывается и левый крайний уровень у хлебных крошек, оставляя
            видимым только крайний правый уровень.
        </div>
        <example-top-bar-breadcrumbs [style.width.px]="500" />

        <div>
            Минимальная ширина левой стороны зависит от заголовка текущего пункта, который может быть обрезан до 3
            символов с добавлением трех точек (…).
        </div>
        <example-top-bar-breadcrumbs [style.width.px]="400" />

        <div>
            После достижения минимальной ширины у левой стороны можно приступить к сжатию правой стороны с действиями.
        </div>
        <example-top-bar-breadcrumbs [style.width.px]="300" />
    `,
    styles: `
        ::ng-deep .docs-live-example__example_top-bar-title-counter-adaptive {
            background: var(--kbq-background-bg-secondary);
        }

        div {
            color: var(--kbq-foreground-contrast-secondary);
            margin: var(--kbq-size-s) var(--kbq-size-s) 0;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopBarBreadcrumbsAdaptiveExample {}
