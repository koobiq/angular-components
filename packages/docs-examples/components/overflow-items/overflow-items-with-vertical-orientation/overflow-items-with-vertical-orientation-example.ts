import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { KbqOverflowItemsModule } from '@koobiq/components/overflow-items';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Overflow items with vertical orientation
 */
@Component({
    standalone: true,
    imports: [KbqOverflowItemsModule, KbqBadgeModule, KbqToggleModule, FormsModule],
    selector: 'overflow-items-with-vertical-orientation-example',
    template: `
        <kbq-toggle class="layout-margin-bottom-m" [(ngModel)]="reverseOverflowOrder">
            Reverse overflow order
        </kbq-toggle>

        <div class="example-resize-container">
            <div
                #kbqOverflowItems="kbqOverflowItems"
                kbqOverflowItems
                orientation="vertical"
                [reverseOverflowOrder]="reverseOverflowOrder()"
            >
                @if (reverseOverflowOrder()) {
                    <div kbqOverflowItemsResult class="layout-margin-bottom-xs">
                        and {{ kbqOverflowItems.hiddenItemIDs().size }} more
                    </div>
                }
                @for (item of items; track item.id) {
                    <kbq-badge
                        [class.layout-margin-bottom-xs]="!$last"
                        [kbqOverflowItem]="item.id"
                        [alwaysVisible]="item.alwaysVisible"
                        [badgeColor]="item.alwaysVisible ? badgeColor.Theme : badgeColor.FadeContrast"
                    >
                        {{ item.id }}
                    </kbq-badge>
                }
                @if (!reverseOverflowOrder()) {
                    <div kbqOverflowItemsResult>and {{ kbqOverflowItems.hiddenItemIDs().size }} more</div>
                }
            </div>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            height: 400px;
        }

        .example-resize-container {
            display: flex;
            overflow: hidden;
            resize: vertical;
            height: 100%;
            max-height: 100%;
            min-height: 60px;
            border: 1px solid var(--kbq-line-contrast-less);
            border-radius: var(--kbq-size-border-radius);
            padding: var(--kbq-size-xxs);
            width: 100px;
        }

        .kbq-overflow-items-result {
            text-wrap: nowrap;
            text-align: center;
            color: var(--kbq-foreground-contrast-secondary);
            user-select: none;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverflowItemsWithVerticalOrientationExample {
    readonly items = Array.from({ length: 20 }, (_, i) => ({
        id: `Item${i}`,
        alwaysVisible: i === 8
    }));
    readonly reverseOverflowOrder = model(false);
    readonly badgeColor = KbqBadgeColors;
}
