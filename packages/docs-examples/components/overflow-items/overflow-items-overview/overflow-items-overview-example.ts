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

        <kbq-overflow-items [reverseOverflowOrder]="reverseOverflowOrder()">
            <ng-template kbqOverflowItemsResult let-hiddenItemIDs>
                <div [class.layout-margin-right-xs]="reverseOverflowOrder()">and {{ hiddenItemIDs.size }} more</div>
            </ng-template>
            @for (item of items; track item; let last = $last) {
                <kbq-badge *kbqOverflowItem="item" [class.layout-margin-right-xs]="!last">{{ item }}</kbq-badge>
            }
        </kbq-overflow-items>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverflowItemsOverviewExample {
    readonly items = Array.from({ length: 20 }).map((_, i) => `Item${i}`);

    readonly reverseOverflowOrder = signal(false);
}
