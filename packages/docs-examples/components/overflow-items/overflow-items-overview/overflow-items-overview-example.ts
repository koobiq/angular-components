import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqOverflowItemsModule } from '@koobiq/components/overflow-items';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Overflow items overview
 */
@Component({
    standalone: true,
    imports: [
        KbqOverflowItemsModule,
        KbqBadgeModule,
        KbqToggleModule,
        FormsModule
    ],
    selector: 'overflow-items-overview-example',
    template: `
        <kbq-toggle
            class="layout-margin-bottom-m"
            [ngModel]="reverseOverflowOrder()"
            (ngModelChange)="reverseOverflowOrder.set($event)"
        >
            Reverse overflow order
        </kbq-toggle>

        <div #kbqOverflowItems="kbqOverflowItems" [reverseOverflowOrder]="reverseOverflowOrder()" kbqOverflowItems>
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
        }

        .kbq-overflow-items-result {
            text-wrap: nowrap;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverflowItemsOverviewExample {
    readonly items = Array.from({ length: 20 }).map((_, i) => `Item${i}`);

    readonly reverseOverflowOrder = signal(false);
}
