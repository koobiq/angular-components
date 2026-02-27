import { ChangeDetectionStrategy, Component, effect, ElementRef, input, signal, viewChild } from '@angular/core';
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
            [reverseOverflowOrder]="order()"
            [wrap]="'wrap'"
        >
            @for (item of countries; track item) {
                <span [kbqOverflowItem]="item" [class.layout-margin-right-xs]="!$last">
                    <span>
                        {{ item }}
                    </span>
                    <span>,</span>
                </span>
            }
            @if (expanded()) {
                <a
                    kbq-link
                    pseudo
                    [kbqOverflowItem]="'expanded'"
                    [alwaysVisible]
                    (click)="expanded.set(!this.expanded())"
                >
                    Hide
                </a>
            }
            <a kbqOverflowItemsResult kbq-link pseudo (click)="expanded.set(!this.expanded())">
                @if (expanded()) {
                    Hide
                } @else {
                    and {{ kbqOverflowItems.hiddenItemIDs().size }}
                }
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
    rows = input(1);

    overflowItemsContainer = viewChild.required<ElementRef<HTMLDivElement>>('overflowItemsContainer');

    protected order = signal(false);
    protected expanded = signal(false);
    protected countries = [
        'Australia',
        'Austria',
        'Argentina',
        'Belgium',
        'Brazil',
        'United Kingdom',
        'Germany',
        'Greece',
        'Denmark',
        'Egypt',
        'India',
        'Spain',
        'Italy',
        'Canada',
        'Mexico',
        'Netherlands',
        'Norway',
        'Poland',
        'Portugal',
        'Russia',
        'United States',
        'Thailand',
        'Turkey',
        'France',
        'Japan'
    ];

    constructor() {
        effect(() => {
            const overflowItemsContainer = this.overflowItemsContainer().nativeElement;

            if (this.expanded()) {
                overflowItemsContainer.style.maxHeight = 'unset';
                // TODO paddings
                overflowItemsContainer.style.width = `${overflowItemsContainer.offsetWidth}px`;
            } else {
                overflowItemsContainer.style.maxHeight = `${overflowItemsContainer.offsetHeight}px`;
            }
        });
    }
}
