import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, KbqOptionModule, PopUpPlacements } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqOverflowItemsModule } from '@koobiq/components/overflow-items';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { KbqTopBarModule } from '@koobiq/components/top-bar';
import { map } from 'rxjs/operators';

type ExampleAction = {
    id: string;
    icon: string;
};

/**
 * @title TopBar Secondary Actions Responsive
 */
@Component({
    standalone: true,
    selector: 'top-bar-secondary-actions-responsive-example',
    imports: [
        KbqTopBarModule,
        KbqOverflowItemsModule,
        KbqDropdownModule,
        KbqButtonModule,
        KbqIconModule,
        KbqOptionModule,
        KbqToolTipModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <kbq-top-bar>
            <div class="layout-align-center-center" kbqTopBarContainer placement="start">
                <div class="layout-row layout-padding-m flex-none">
                    <i class="layout-row flex" kbq-icon="kbq-dashboard_16"></i>
                </div>
                <div class="kbq-title kbq-truncate-line">Dashboard</div>
            </div>

            <div kbqTopBarSpacer></div>

            <div class="layout-align-end-center" kbqTopBarContainer placement="end">
                <button
                    [kbqStyle]="KbqButtonStyles.Outline"
                    [color]="KbqComponentColors.ContrastFade"
                    [kbqTooltipDisabled]="isDesktop()"
                    [kbqTooltipArrow]="false"
                    [kbqPlacement]="PopUpPlacements.Bottom"
                    kbqTooltip="Cancel"
                    kbq-button
                >
                    @if (!isDesktop()) {
                        <i kbq-icon="kbq-undo_16"></i>
                    }
                    @if (isDesktop()) {
                        Cancel
                    }
                </button>
                <button
                    [color]="KbqComponentColors.Contrast"
                    [kbqTooltipDisabled]="isDesktop()"
                    [kbqTooltipArrow]="false"
                    [kbqPlacement]="PopUpPlacements.Bottom"
                    kbqTooltip="Save"
                    kbq-button
                >
                    @if (!isDesktop()) {
                        <i kbq-icon="kbq-floppy-disk_16"></i>
                    }
                    @if (isDesktop()) {
                        Save
                    }
                </button>

                <div #kbqOverflowItems="kbqOverflowItems" kbqOverflowItems>
                    @for (action of secondaryActions; track action.id) {
                        <button
                            [kbqOverflowItem]="action.id"
                            [kbqStyle]="KbqButtonStyles.Transparent"
                            [color]="KbqComponentColors.Contrast"
                            [kbqTooltipDisabled]="isDesktop()"
                            [kbqTooltipArrow]="false"
                            [kbqPlacement]="PopUpPlacements.Bottom"
                            [kbqTooltip]="action.id"
                            kbq-button
                        >
                            <i [class]="action.icon" kbq-icon=""></i>
                            @if (isDesktop()) {
                                {{ action.id }}
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
                            <kbq-optgroup label="Actions" />
                            @for (action of secondaryActions; track action.id) {
                                @if (kbqOverflowItems.hiddenItemIDs().has(action.id)) {
                                    <button kbq-dropdown-item>
                                        <i [class]="action.icon" kbq-icon=""></i>
                                        {{ action.id }}
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
            max-width: 451px;
            gap: var(--kbq-top-bar-right-gap);
            height: 100%;
            padding: 1px;
        }

        .kbq-top-bar-container__end {
            position: relative;
            flex-grow: 1;
            overflow: hidden;
            height: 100%;
            flex-wrap: nowrap;
            white-space: nowrap;
            padding: 1px;
        }

        @media screen and (max-width: 768px) {
            .kbq-overflow-items {
                max-width: 152px;
            }
        }

        @media screen and (min-width: 1201px) {
            .kbq-overflow-items {
                max-width: 32px;
            }
        }
    `
})
export class TopBarSecondaryActionsResponsiveExample {
    isDesktop = toSignal(
        inject(BreakpointObserver)
            .observe('(min-width: 900px)')
            .pipe(
                takeUntilDestroyed(),
                map(({ matches }) => matches)
            ),
        { initialValue: true }
    );

    readonly secondaryActions: ExampleAction[] = [
        { id: 'Verdict', icon: 'kbq-question-circle_16' },
        { id: 'Link to incident', icon: 'kbq-link_16' },
        { id: 'Archive', icon: 'kbq-box-archive-arrow-down_16' },
        { id: 'Remove', icon: 'kbq-trash_16' }
    ];

    protected readonly PopUpPlacements = PopUpPlacements;
    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;
}
