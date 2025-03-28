import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqOverflowItemsModule } from '@koobiq/components/overflow-items';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Overflow items result offset
 */
@Component({
    standalone: true,
    imports: [
        KbqOverflowItemsModule,
        KbqBadgeModule,
        KbqToggleModule,
        FormsModule
    ],
    selector: 'overflow-items-overflow-order-example',
    template: `
        <div class="layout-margin-bottom-l kbq-mono-normal">reverseOverflowOrder="true"</div>
        <div #kbqOverflowItemsReverse="kbqOverflowItems" [debounceTime]="0" reverseOverflowOrder kbqOverflowItems>
            <kbq-badge class="layout-margin-right-xs" [kbqOverflowItem]="items[0]" [order]="items.length">
                {{ items[0] }}
            </kbq-badge>
            <div class="layout-margin-right-xs" kbqOverflowItemsResult>
                and {{ kbqOverflowItemsReverse.hiddenItemIDs().size }} more
            </div>
            @for (item of items.slice(1); track item) {
                <kbq-badge [kbqOverflowItem]="item" [class.layout-margin-right-xs]="!$last">
                    {{ item }}
                </kbq-badge>
            }
        </div>

        <div class="layout-margin-bottom-l layout-margin-top-l kbq-mono-normal">reverseOverflowOrder="false"</div>
        <div #kbqOverflowItems="kbqOverflowItems" [debounceTime]="0" [reverseOverflowOrder]="false" kbqOverflowItems>
            @for (item of items.slice(0, -1); track item) {
                <kbq-badge class="layout-margin-right-xs" [kbqOverflowItem]="item">
                    {{ item }}
                </kbq-badge>
            }
            <div class="layout-margin-right-xs" kbqOverflowItemsResult>
                and {{ kbqOverflowItems.hiddenItemIDs().size }} more
            </div>
            <kbq-badge [kbqOverflowItem]="items[items.length - 1]" [order]="-1">
                {{ items[items.length - 1] }}
            </kbq-badge>
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
export class OverflowItemsOverflowOrderExample {
    readonly items = Array.from({ length: 20 }).map((_, i) => `Item${i}`);

    readonly reverseOverflowOrder = signal(false);
}
