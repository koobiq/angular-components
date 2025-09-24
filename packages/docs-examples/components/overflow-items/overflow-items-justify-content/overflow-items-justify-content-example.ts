import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqOverflowItemsModule } from '@koobiq/components/overflow-items';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Overflow items justify content
 */
@Component({
    standalone: true,
    imports: [KbqOverflowItemsModule, KbqBadgeModule, KbqSelectModule, FormsModule, KbqFormFieldModule],
    selector: 'overflow-items-justify-content-example',
    template: `
        <kbq-form-field>
            <kbq-select [(ngModel)]="justifyContent">
                @for (option of justifyContentOptions; track option) {
                    <kbq-option [value]="option">{{ option }}</kbq-option>
                }
            </kbq-select>
        </kbq-form-field>

        <div #kbqOverflowItems="kbqOverflowItems" kbqOverflowItems [style.justify-content]="justifyContent()">
            @for (item of items; track item) {
                <kbq-badge [kbqOverflowItem]="item" [class.layout-margin-right-xs]="!$last">
                    {{ item }}
                </kbq-badge>
            }
            <div class="layout-margin-right-xs" kbqOverflowItemsResult>
                and {{ kbqOverflowItems.hiddenItemIDs().size }} more
            </div>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            padding-right: var(--kbq-size-3xs);
        }

        .kbq-overflow-items {
            resize: horizontal;
            max-width: 100%;
            min-width: 150px;
            border: 1px solid var(--kbq-line-contrast-less);
            border-radius: var(--kbq-size-border-radius);
            padding: var(--kbq-size-xxs);
        }

        .kbq-overflow-items-result {
            text-wrap: nowrap;
            color: var(--kbq-foreground-contrast-secondary);
            user-select: none;
        }

        .kbq-form-field {
            margin-bottom: var(--kbq-size-m);
            max-width: 200px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverflowItemsJustifyContentExample {
    readonly items = Array.from({ length: 7 }, (_, i) => `Item${i}`);
    readonly justifyContentOptions = ['center', 'start', 'end', 'space-between', 'space-around'] as const;
    readonly justifyContent = model(this.justifyContentOptions[0]);
}
