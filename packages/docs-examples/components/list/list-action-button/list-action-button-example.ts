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
    selector: 'list-action-button-example',
    imports: [KbqListModule, FormsModule, KbqDropdownModule, KbqToolTipModule, KbqBadgeModule],
    template: `
        <kbq-list-selection style="width: 400px" aria-label="Elements" [autoSelect]="false" [(ngModel)]="selected">
            <kbq-list-option value="An element with a very very very long name">
                <div>Element with a very very very very very very long name</div>

                <kbq-option-action
                    kbqTooltip="Tooltip text"
                    [kbqDropdownTriggerFor]="dropdown"
                    [kbqPlacement]="PopUpPlacements.Right"
                />
            </kbq-list-option>
            @for (item of [1, 2, 3, 4, 5, 6, 7, 8, 9]; track item) {
                <kbq-list-option [value]="getText(item)">
                    <div class="layout-row layout-align-space-between">
                        Item {{ item }}
                        <kbq-badge style="align-self: center" badgeColor="theme" [compact]="true">badge</kbq-badge>
                    </div>
                    <kbq-option-action
                        kbqTooltip="Tooltip text"
                        [kbqDropdownTriggerFor]="dropdown"
                        [kbqPlacement]="PopUpPlacements.Right"
                    />
                </kbq-list-option>
            }
        </kbq-list-selection>
        <br />
        <div>Selected: {{ selected }}</div>

        <kbq-dropdown #dropdown>
            <button kbq-dropdown-item type="button">item 1</button>
            <button kbq-dropdown-item type="button">item 2</button>
            <button kbq-dropdown-item type="button">item 3</button>
        </kbq-dropdown>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListActionButtonExample {
    selected = [];
    protected readonly PopUpPlacements = PopUpPlacements;

    getText(text: string | number): string {
        return `Item ${text}`;
    }
}
