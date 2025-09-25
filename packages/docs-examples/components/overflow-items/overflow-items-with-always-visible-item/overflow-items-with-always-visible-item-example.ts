import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { KbqOverflowItemsModule } from '@koobiq/components/overflow-items';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Overflow items with always visible item
 */
@Component({
    standalone: true,
    imports: [KbqOverflowItemsModule, KbqBadgeModule, KbqToggleModule, FormsModule],
    selector: 'overflow-items-with-always-visible-item-example',
    template: `
        <div #kbqOverflowItems="kbqOverflowItems" kbqOverflowItems>
            @for (item of items; track item.id) {
                <kbq-badge
                    [kbqOverflowItem]="item.id"
                    [class.layout-margin-right-xs]="!$last"
                    [alwaysVisible]="item.alwaysVisible"
                    [badgeColor]="item.alwaysVisible ? badgeColor.Theme : badgeColor.FadeContrast"
                >
                    {{ item.id }}
                </kbq-badge>
            }
            <div kbqOverflowItemsResult>and {{ kbqOverflowItems.hiddenItemIDs().size }} more</div>
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
export class OverflowItemsWithAlwaysVisibleItemExample {
    readonly items = Array.from({ length: 20 }, (_, i) => ({
        id: `Item${i}`,
        alwaysVisible: i === 3
    }));
    readonly badgeColor = KbqBadgeColors;
}
