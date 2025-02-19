import { BreakpointObserver } from '@angular/cdk/layout';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, KbqOptionModule, PopUpPlacements } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqOverflowItemsModule } from '@koobiq/components/overflow-items';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { KbqTopMenuModule } from '@koobiq/components/top-menu';
import { map, startWith } from 'rxjs/operators';

type ExampleAction = {
    id: string;
    icon: string;
};

/**
 * @title TopMenu Secondary Actions Responsive
 */
@Component({
    standalone: true,
    selector: 'top-menu-secondary-actions-responsive-example',
    imports: [
        AsyncPipe,
        KbqTopMenuModule,
        KbqOverflowItemsModule,
        KbqDropdownModule,
        KbqButtonModule,
        KbqIconModule,
        KbqOptionModule,
        KbqToolTipModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        @let isDesktopMatches = isDesktop | async;
        <kbq-top-menu>
            <div class="kbq-top-menu-container__left layout-row layout-align-center-center">
                <div class="layout-row layout-padding-m flex-none">
                    <i class="layout-row flex" kbq-icon="kbq-dashboard_16"></i>
                </div>
                <div class="kbq-title kbq-text-ellipsis">Dashboard</div>
            </div>
            <div class="kbq-top-menu__spacer"></div>

            <div class="kbq-top-menu-container__right layout-row layout-align-end-center">
                <button
                    [kbqStyle]="KbqButtonStyles.Outline"
                    [color]="KbqComponentColors.ContrastFade"
                    [kbqTooltipDisabled]="isDesktopMatches"
                    [kbqTooltipArrow]="false"
                    [kbqPlacement]="PopUpPlacements.Bottom"
                    kbqTooltip="Cancel"
                    kbq-button
                >
                    @if (!isDesktopMatches) {
                        <i kbq-icon="kbq-undo_16"></i>
                    }
                    @if (isDesktopMatches) {
                        Cancel
                    }
                </button>
                <button
                    [color]="KbqComponentColors.Contrast"
                    [kbqTooltipDisabled]="isDesktopMatches"
                    [kbqTooltipArrow]="false"
                    [kbqPlacement]="PopUpPlacements.Bottom"
                    kbqTooltip="Save"
                    kbq-button
                >
                    @if (!isDesktopMatches) {
                        <i kbq-icon="kbq-floppy-disk_16"></i>
                    }
                    @if (isDesktopMatches) {
                        Save
                    }
                </button>

                <kbq-overflow-items>
                    <ng-template kbqOverflowItemsResult let-hiddenItemIDs>
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
                            @for (action of secondaryActions; track action.id; let index = $index) {
                                @if (hiddenItemIDs.has(action.id)) {
                                    <button kbq-dropdown-item>
                                        <i [class]="action.icon" kbq-icon=""></i>
                                        {{ action.id }}
                                    </button>
                                }
                            }
                        </kbq-dropdown>
                    </ng-template>

                    @for (action of secondaryActions; track index; let index = $index) {
                        <button
                            *kbqOverflowItem="action.id"
                            [kbqStyle]="KbqButtonStyles.Transparent"
                            [color]="KbqComponentColors.Contrast"
                            [kbqTooltipDisabled]="isDesktopMatches"
                            [kbqTooltipArrow]="false"
                            [kbqPlacement]="PopUpPlacements.Bottom"
                            [kbqTooltip]="action.id"
                            kbq-button
                        >
                            <i [class]="action.icon" kbq-icon=""></i>
                            @if (isDesktopMatches) {
                                {{ action.id }}
                            }
                        </button>
                    }
                </kbq-overflow-items>
            </div>
        </kbq-top-menu>
    `,
    styles: `
        .kbq-text-ellipsis {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .kbq-overflow-items {
            max-width: 451px;
            gap: var(--kbq-top-menu-right-gap);
        }

        .kbq-top-menu-container__right {
            display: flex;
            position: relative;
            flex-grow: 1;
            overflow: hidden;
            flex-wrap: nowrap;
            white-space: nowrap;
        }

        @media screen and (max-width: 1024px) {
            .kbq-overflow-items {
                max-width: 300px;
            }
        }
    `
})
export class TopMenuSecondaryActionsResponsiveExample {
    readonly isDesktop = inject(BreakpointObserver)
        .observe('(min-width: 900px)')
        .pipe(
            startWith({ matches: true }),
            map(({ matches }) => matches)
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
