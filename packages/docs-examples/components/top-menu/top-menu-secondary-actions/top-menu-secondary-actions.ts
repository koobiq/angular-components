import { CdkScrollable } from '@angular/cdk/overlay';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors, KbqOptionModule, PopUpPlacements } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIcon } from '@koobiq/components/icon';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { KbqTopMenuModule } from '@koobiq/components/top-menu';

/**
 * @title TopMenu Secondary Actions
 */
@Component({
    standalone: true,
    selector: 'top-menu-secondary-actions-example',
    imports: [
        KbqTopMenuModule,
        KbqButtonModule,
        KbqToolTipModule,
        KbqIcon,
        AsyncPipe,
        KbqTooltipTrigger,
        CdkScrollable,
        KbqDividerModule,
        KbqDropdownModule,
        KbqOptionModule,
        KbqTitleModule
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
            <div class="kbq-top-menu-container__right layout-row">
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
                    <button kbq-dropdown-item>Edit</button>

                    <button kbq-dropdown-item>
                        Duplicate
                        <div class="kbq-dropdown-item__caption">Caption</div>
                    </button>

                    <button kbq-dropdown-item>
                        Archive
                        <div class="kbq-dropdown-item__caption">Caption</div>
                    </button>

                    <button kbq-dropdown-item>
                        Remove
                        <div class="kbq-dropdown-item__caption">Caption</div>
                    </button>

                    <kbq-divider />

                    <button kbq-dropdown-item>Change Status</button>
                    <button kbq-dropdown-item>Assign User</button>
                </kbq-dropdown>
            </div>
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
export class TopMenuSecondaryActions {
    protected readonly PopUpPlacements = PopUpPlacements;
    protected readonly KbqComponentColors = KbqComponentColors;
    protected readonly KbqButtonStyles = KbqButtonStyles;
}
