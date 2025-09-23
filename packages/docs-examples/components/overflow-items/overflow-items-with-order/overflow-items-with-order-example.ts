import { ChangeDetectionStrategy, Component, computed, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { KbqOverflowItemsModule } from '@koobiq/components/overflow-items';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Overflow items result offset
 */
@Component({
    standalone: true,
    imports: [KbqOverflowItemsModule, KbqBadgeModule, KbqToggleModule, FormsModule],
    selector: 'overflow-items-with-order-example',
    template: `
        <kbq-toggle class="layout-margin-bottom-m" [(ngModel)]="reverseOverflowOrder">
            Reverse overflow order
        </kbq-toggle>

        <div #kbqOverflowItems="kbqOverflowItems" kbqOverflowItems [reverseOverflowOrder]="reverseOverflowOrder()">
            @for (item of items; track $index) {
                @let isLastHiddenItem = $index === 5;

                <kbq-badge
                    [kbqOverflowItem]="item"
                    [class.layout-margin-right-xs]="!$last"
                    [order]="isLastHiddenItem ? this.lastItemOrder() : $index"
                    [badgeColor]="isLastHiddenItem ? badgeColor.Theme : badgeColor.FadeContrast"
                >
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
    readonly badgeColor = KbqBadgeColors;
    readonly reverseOverflowOrder = model(false);
    readonly lastItemOrder = computed(() => (this.reverseOverflowOrder() ? +Infinity : -Infinity));
}
