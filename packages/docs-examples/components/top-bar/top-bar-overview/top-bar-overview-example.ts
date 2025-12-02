import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
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

/**
 * @title TopBar
 */
@Component({
    selector: 'top-bar-overview-example',
    imports: [
        KbqTopBarModule,
        KbqButtonModule,
        KbqToolTipModule,
        KbqIconModule,
        KbqDropdownModule,
        KbqOverflowItemsModule
    ],
    template: `
        <kbq-top-bar>
            <div
                class="layout-row layout-align-center-center layout-padding-top-3xs layout-padding-bottom-3xs"
                kbqTopBarContainer
                placement="start"
            >
                <div class="layout-row layout-margin-right-l flex-none">
                    <img alt="example icon" src="https://koobiq.io/assets/example-icon.svg" width="24" height="24" />
                </div>
                <div class="kbq-title kbq-truncate-line">Dashboards</div>
            </div>

            <div kbqTopBarSpacer></div>

            <div kbqTopBarContainer placement="end">
                <div #kbqOverflowItems="kbqOverflowItems" kbqOverflowItems>
                    @for (action of actions; track action.id) {
                        <button
                            kbq-button
                            [kbqOverflowItem]="action.id"
                            [kbqStyle]="action.style"
                            [color]="action.color"
                            [kbqPlacement]="PopUpPlacements.Bottom"
                            [kbqTooltipArrow]="false"
                            [kbqTooltipDisabled]="isDesktop()"
                            [kbqTooltip]="action.text || action.id"
                        >
                            @if (action.icon) {
                                <i kbq-icon="" [class]="action.icon"></i>
                            }
                            @if ((action.text && isDesktop()) || (!action.icon && action.text)) {
                                {{ action.text }}
                            }
                        </button>
                    }

                    <div kbqOverflowItemsResult>
                        <button
                            kbq-button
                            [kbqStyle]="KbqButtonStyles.Transparent"
                            [color]="KbqComponentColors.Contrast"
                            [kbqDropdownTriggerFor]="appDropdown"
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
            </div>
        </kbq-top-bar>
    `,
    styles: `
        :host {
            .kbq-top-bar-container__start {
                --kbq-top-bar-container-start-basis: 115px;
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopBarOverviewExample {
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
            text: 'Create dashboard'
        }
    ];

    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;
    protected readonly PopUpPlacements = PopUpPlacements;
}
