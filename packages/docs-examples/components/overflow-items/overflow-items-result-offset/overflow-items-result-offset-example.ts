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
    selector: 'overflow-items-result-offset-example',
    template: `
        <div #kbqOverflowItems="kbqOverflowItems" [overflowStartIndex]="1" reverseOverflowOrder kbqOverflowItems>
            <kbq-badge class="layout-margin-right-xs" [kbqOverflowItem]="items[0]">
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
        }

        .kbq-overflow-items-result {
            text-wrap: nowrap;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverflowItemsResultOffsetExample {
    readonly items = Array.from({ length: 20 }).map((_, i) => `Item${i}`);

    readonly reverseOverflowOrder = signal(false);
}
