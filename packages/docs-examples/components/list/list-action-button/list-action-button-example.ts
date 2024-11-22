import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PopUpPlacements } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqListModule } from '@koobiq/components/list';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title List action button
 */
@Component({
    standalone: true,
    selector: 'list-action-button-example',
    imports: [KbqListModule, FormsModule, KbqDropdownModule, KbqToolTipModule],
    template: `
        <kbq-list-selection [(ngModel)]="selected" [autoSelect]="false">
            @for (item of [1, 2, 3, 4, 5, 6, 7, 8, 9]; track item) {
                <kbq-list-option [value]="'Item ' + item">
                    Item {{ item }}
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
