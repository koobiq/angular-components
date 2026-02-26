import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { KbqBadge, KbqBadgeCssStyler } from '@koobiq/components/badge';
import { KbqOverflowItem, KbqOverflowItems, KbqOverflowItemsResult } from '@koobiq/components/overflow-items';

/**
 * @title Overflow items as clamped list
 */
@Component({
    selector: 'overflow-items-as-clamped-list-example',
    imports: [
        KbqOverflowItems,
        KbqOverflowItem,
        KbqOverflowItemsResult,
        KbqBadge,
        KbqBadgeCssStyler
    ],
    template: `
        <div #kbqOverflowItems="kbqOverflowItems" kbqOverflowItems style="max-height: 48px;" [wrap]="'wrap'">
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
export class OverflowItemsAsClampedListExample {
    readonly items = Array.from({ length: 7 }, (_, i) => `Item${i}`);
    readonly justifyContentOptions = ['center', 'start', 'end', 'space-between', 'space-around'] as const;
    readonly justifyContent = model(this.justifyContentOptions[0]);
}
