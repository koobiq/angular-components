import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqOverflowItemsModule } from '@koobiq/components/overflow-items';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Overflow items overview
 */
@Component({
    selector: 'overflow-items-overview-example',
    imports: [KbqOverflowItemsModule, KbqBadgeModule, KbqToggleModule, FormsModule],
    template: `
        <kbq-toggle class="layout-margin-bottom-m" [(ngModel)]="reverseOverflowOrder">
            Reverse overflow order
        </kbq-toggle>

        <div #kbqOverflowItems="kbqOverflowItems" kbqOverflowItems [reverseOverflowOrder]="reverseOverflowOrder()">
            @if (reverseOverflowOrder()) {
                <div class="layout-margin-right-xs" kbqOverflowItemsResult>
                    and {{ kbqOverflowItems.hiddenItemIDs().size }} more
                </div>
            }
            @for (item of items; track item) {
                <kbq-badge [kbqOverflowItem]="item" [class.layout-margin-right-xs]="!$last">
                    {{ item }}
                </kbq-badge>
            }
            @if (!reverseOverflowOrder()) {
                <div kbqOverflowItemsResult>and {{ kbqOverflowItems.hiddenItemIDs().size }} more</div>
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
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverflowItemsOverviewExample {
    readonly items = Array.from({ length: 20 }, (_, i) => `Item${i}`);
    readonly reverseOverflowOrder = model(false);
}
