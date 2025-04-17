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
 * @title TopBar Actions
 */
@Component({
    standalone: true,
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
    `,
    styles: `
        .kbq-overflow-items {
            max-width: 368px;
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
            icon: 'kbq-arrows-rotate_16',
            text: 'Refresh',
            color: KbqComponentColors.Contrast,
            style: KbqButtonStyles.Transparent
        },
        {
            id: 'search',
            icon: 'kbq-magnifying-glass_16',
            color: KbqComponentColors.Contrast,
            style: KbqButtonStyles.Transparent
        },
        { id: 'list', icon: 'kbq-list_16', color: KbqComponentColors.Contrast, style: KbqButtonStyles.Transparent },
        { id: 'filter', icon: 'kbq-filter_16', color: KbqComponentColors.Contrast, style: KbqButtonStyles.Transparent },
        { id: 'button1', text: 'Button', color: KbqComponentColors.ContrastFade, style: '' },
        { id: 'button2', text: 'Button', color: KbqComponentColors.Contrast, style: '' }
    ];

    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;
    protected readonly PopUpPlacements = PopUpPlacements;
}
