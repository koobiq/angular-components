import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqListModule } from '@koobiq/components/list';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title List action button
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'list-action-button-example',
    imports: [KbqListModule, FormsModule, KbqDropdownModule, KbqToolTipModule, KbqBadgeModule],
    template: `
        <kbq-list-selection style="width: 400px" [autoSelect]="false" [(ngModel)]="selected">
            <kbq-list-option [value]="'An element with a very very very long name'">
                <div>Element with a very very very very very very long name</div>

                <kbq-option-action
                    [kbqDropdownTriggerFor]="dropdown"
                    [kbqPlacement]="PopUpPlacements.Right"
                    [kbqTooltip]="'Tooltip text'"
                />
            </kbq-list-option>
            @for (item of [1, 2, 3, 4, 5, 6, 7, 8, 9]; track item) {
                <kbq-list-option [value]="'Item ' + item">
                    <div class="layout-row layout-align-space-between">
                        Item {{ item }}
                        <kbq-badge style="align-self: center" badgeColor="theme" [compact]="true">badge</kbq-badge>
                    </div>
                    <kbq-option-action
                        [kbqDropdownTriggerFor]="dropdown"
                        [kbqPlacement]="PopUpPlacements.Right"
                        [kbqTooltip]="'Tooltip text'"
                    />
                </kbq-list-option>
            }
        </kbq-list-selection>
        <br />
        <div>Selected: {{ selected }}</div>

        <kbq-dropdown #dropdown>
            <button kbq-dropdown-item>item 1</button>
            <button kbq-dropdown-item>item 2</button>
            <button kbq-dropdown-item>item 3</button>
        </kbq-dropdown>
    `
})
export class ListActionButtonExample {
    selected = [];
    protected readonly PopUpPlacements = PopUpPlacements;
}
