import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { KbqLink } from '@koobiq/components/link';
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
        KbqLink
    ],
    template: `
        <div
            #overflowItemsContainer
            #kbqOverflowItems="kbqOverflowItems"
            kbqOverflowItems
            style="max-height: 48px; min-width: 60px"
            [wrap]="'wrap'"
        >
            @for (item of items; track item) {
                <span [kbqOverflowItem]="item" [class.layout-margin-right-xs]="!$last">
                    <span>
                        {{ item }}
                    </span>
                    @if (!$last) {
                        <span>,</span>
                    }
                </span>
            }
            <a kbqOverflowItemsResult kbq-link pseudo (click)="expand(overflowItemsContainer)">
                еще {{ kbqOverflowItems.hiddenItemIDs().size }}
            </a>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            padding-right: var(--kbq-size-3xs);
        }

        .kbq-overflow-item {
            display: inline-flex;
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
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverflowItemsAsClampedListExample {
    readonly items = Array.from({ length: 7 }, (_, i) => `Item${i}`);
    readonly changeDetectorRef = inject(ChangeDetectorRef);

    expand(overflowItemsContainer: HTMLDivElement) {
        overflowItemsContainer.style.maxHeight = 'unset';
        this.changeDetectorRef.detectChanges();
    }
}
