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
    alwaysVisible?: boolean;
};

/**
 * @title TopBar Actions
 */
@Component({
    selector: 'top-bar-actions-example',
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
                class="layout-row layout-align-center-center layout-padding-top-3xs layout-padding-bottom-3xs kbq-title kbq-truncate-line"
                kbqTopBarContainer
                placement="start"
            >
                <span class="kbq-truncate-line">Actions</span>
            </div>

            <div kbqTopBarSpacer></div>

            <div kbqTopBarContainer placement="end">
                <div #kbqOverflowItems="kbqOverflowItems" kbqOverflowItems>
                    @for (action of actions; track action.id) {
                        <button
                            kbq-button
                            [kbqOverflowItem]="action.id"
                            [alwaysVisible]="action?.alwaysVisible"
                            [kbqStyle]="action.style"
                            [color]="action.color"
                            [kbqPlacement]="PopUpPlacements.Bottom"
                            [kbqTooltipArrow]="false"
                            [kbqTooltipDisabled]="canTooltipBeAppied(action)"
                            [kbqTooltip]="action.text || action.id"
                        >
                            @if (action.icon) {
                                <i kbq-icon="" [class]="action.icon"></i>
                            }
                            @if (canTooltipBeAppied(action)) {
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
        .kbq-overflow-items {
            max-width: 400px;
        }

        :host {
            .kbq-top-bar-container__start {
                --kbq-top-bar-container-start-basis: 55px;
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopBarActionsExample {
    readonly isDesktop = toSignal(
        inject(BreakpointObserver)
            .observe('(min-width: 900px)')
            .pipe(
                takeUntilDestroyed(),
                map(({ matches }) => matches)
            ),
        { initialValue: true }
    );

    readonly actions: ExampleAction[] = [
        {
            id: 'refresh',
            icon: 'kbq-arrow-rotate-right_16',
            text: 'Reload',
            color: KbqComponentColors.Contrast,
            style: KbqButtonStyles.Transparent
        },
        {
            id: 'Search',
            icon: 'kbq-magnifying-glass_16',
            color: KbqComponentColors.Contrast,
            style: KbqButtonStyles.Transparent
        },
        { id: 'List', icon: 'kbq-list_16', color: KbqComponentColors.Contrast, style: KbqButtonStyles.Transparent },
        { id: 'Filter', icon: 'kbq-filter_16', color: KbqComponentColors.Contrast, style: KbqButtonStyles.Transparent },
        { id: 'Action', text: 'Action', color: KbqComponentColors.ContrastFade, style: '' },
        {
            id: 'primary-action',
            text: 'Primary action',
            color: KbqComponentColors.Contrast,
            style: '',
            alwaysVisible: true
        },
        ...Array.from({ length: 3 }, (_, i) => ({
            id: `action${i + 7}`,
            text: `Action ${i + 7}`,
            color: KbqComponentColors.ContrastFade,
            style: ''
        }))
    ];

    // only show tooltip on button icon
    canTooltipBeAppied(action: ExampleAction): boolean {
        return (!!action.text && this.isDesktop()) || (!action.icon && !!action.text);
    }

    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;
    protected readonly PopUpPlacements = PopUpPlacements;
}
