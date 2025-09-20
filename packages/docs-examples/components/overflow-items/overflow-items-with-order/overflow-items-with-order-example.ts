import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqOverflowItemsModule } from '@koobiq/components/overflow-items';

/**
 * @title Overflow items result offset
 */
@Component({
    standalone: true,
    imports: [KbqOverflowItemsModule, KbqBadgeModule],
    selector: 'overflow-items-with-order-example',
    template: `
        <div #kbqOverflowItems="kbqOverflowItems" reverseOverflowOrder kbqOverflowItems>
            <kbq-badge class="layout-margin-right-xs" [kbqOverflowItem]="items[0]" [order]="items.length">
                {{ items[0] }}
            </kbq-badge>
            <div class="layout-margin-right-xs" kbqOverflowItemsResult>
                and {{ kbqOverflowItems.hiddenItemIDs().size }} more
            </div>
            @for (item of items.slice(1); track item) {
                <kbq-badge [kbqOverflowItem]="item" [class.layout-margin-right-xs]="!$last">
                    {{ item }}
                </kbq-badge>
            }
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
            min-width: 90px;
            min-height: var(--kbq-size-xxl);
            border: 1px solid var(--kbq-line-contrast-less);
            border-radius: var(--kbq-size-border-radius);
            padding: var(--kbq-size-xxs);
        }

        .kbq-overflow-items-result {
            text-wrap: nowrap;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverflowItemsWithOrderExample {
    readonly items = Array.from({ length: 20 }, (_, i) => `Item${i}`);
}
