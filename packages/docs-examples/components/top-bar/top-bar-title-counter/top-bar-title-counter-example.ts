import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, KbqFormattersModule, PopUpPlacements } from '@koobiq/components/core';
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
    alwaysVisible?: boolean;
};

/**
 * @title TopBar With Title And Counter
 */
@Component({
    standalone: true,
    selector: 'top-bar-title-counter-example',
    imports: [
        KbqTopBarModule,
        KbqButtonModule,
        KbqToolTipModule,
        KbqIconModule,
        KbqDropdownModule,
        KbqOverflowItemsModule,
        KbqFormattersModule
    ],
    template: `
        <kbq-top-bar>
            <div
                class="layout-row layout-align-center-center layout-padding-top-3xs layout-padding-bottom-3xs"
                kbqTopBarContainer
                placement="start"
            >
                <div class="layout-row layout-margin-right-l flex-none">
                    <img alt="example icon" src="assets/example-icon.svg" width="24" height="24" />
                </div>
                <div class="kbq-title kbq-truncate-line example-kbq-top-bar__title">
                    <span class="kbq-truncate-line layout-margin-right-xs">Dashboards</span>

                    <span class="example-kbq-top-bar__counter">{{ 13294 | kbqNumber: '' : 'en-US' }}</span>
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
                        [kbqTooltip]="action.text || action.id.toString()"
                        [alwaysVisible]="action?.alwaysVisible"
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
    `,
    styles: `
        :host {
            .kbq-top-bar-container__start {
                --kbq-top-bar-container-start-basis: 160px;
            }
        }

        .example-kbq-top-bar__counter {
            color: var(--kbq-foreground-contrast-tertiary);
        }

        .example-kbq-top-bar__title {
            display: inline-flex;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopBarTitleCounterExample {
    readonly isDesktop = toSignal(
        inject(BreakpointObserver)
            .observe('(min-width: 900px)')
            .pipe(
                takeUntilDestroyed(),
                map(({ matches }) => matches)
            ),
        { initialValue: true }
    );

    protected readonly actions: ExampleAction[] = [
        {
            id: '1',
            color: KbqComponentColors.Contrast,
            style: KbqButtonStyles.Transparent,
            icon: 'kbq-list_16',
            text: 'List'
        },
        {
            id: '2',
            color: KbqComponentColors.Contrast,
            style: KbqButtonStyles.Transparent,
            icon: 'kbq-filter_16',
            text: 'Filter'
        },
        {
            id: '3',
            color: KbqComponentColors.Contrast,
            style: '',
            icon: 'kbq-plus_16',
            text: 'Create dashboard',
            alwaysVisible: true
        }
    ];

    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;
    protected readonly PopUpPlacements = PopUpPlacements;
}
