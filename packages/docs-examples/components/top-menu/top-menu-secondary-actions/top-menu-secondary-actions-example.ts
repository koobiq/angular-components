import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, KbqOptionModule, PopUpPlacements } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqOverflowItemsModule } from '@koobiq/components/overflow-items';
import { KbqTopMenuModule } from '@koobiq/components/top-menu';

type ExampleAction = {
    id: string;
    icon: string;
};

/**
 * @title TopMenu Secondary Actions Simple
 */
@Component({
    standalone: true,
    selector: 'top-menu-secondary-actions-example',
    imports: [
        AsyncPipe,
        KbqTopMenuModule,
        KbqOverflowItemsModule,
        KbqDropdownModule,
        KbqButtonModule,
        KbqIconModule,
        KbqOptionModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <kbq-top-menu>
            <div class="kbq-top-menu-container__left layout-row layout-align-center-center">
                <div class="layout-row layout-padding-m flex-none">
                    <i class="layout-row flex" kbq-icon="kbq-dashboard_16"></i>
                </div>
                <div class="kbq-title kbq-text-ellipsis">Dashboard</div>
            </div>
            <div class="kbq-top-menu__spacer"></div>

            <kbq-overflow-items class="kbq-top-menu-container__right">
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
                        @for (action of actions; track action.id; let index = $index) {
                            @if (hiddenItemIDs.has(action.id)) {
                                <button kbq-dropdown-item>
                                    <i [class]="action.icon" kbq-icon=""></i>
                                    {{ action.id }}
                                </button>
                            }
                        }
                    </kbq-dropdown>
                </ng-template>

                @for (action of actions; track index; let index = $index) {
                    <button
                        *kbqOverflowItem="action.id"
                        [kbqStyle]="KbqButtonStyles.Transparent"
                        [color]="KbqComponentColors.Contrast"
                        kbq-button
                    >
                        <i [class]="action.icon" kbq-icon=""></i>
                        {{ action.id }}
                    </button>
                }
            </kbq-overflow-items>
        </kbq-top-menu>
    `,
    styles: `
        .kbq-text-ellipsis {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    `
})
export class TopMenuSecondaryActionsExample {
    readonly actions: ExampleAction[] = [
        { id: 'Responsible', icon: 'kbq-user_16' },
        { id: 'Status', icon: 'kbq-arrow-right-s_16' },
        { id: 'Verdict', icon: 'kbq-question-circle_16' },
        { id: 'Link to incident', icon: 'kbq-link_16' },
        { id: 'Archive', icon: 'kbq-box-archive-arrow-down_16' },
        { id: 'Remove', icon: 'kbq-trash_16' }
    ];

    protected readonly PopUpPlacements = PopUpPlacements;
    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;
}
