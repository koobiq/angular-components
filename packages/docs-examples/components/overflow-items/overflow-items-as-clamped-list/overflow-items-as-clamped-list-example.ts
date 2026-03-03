import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqLink } from '@koobiq/components/link';
import { KbqOverflowItem, KbqOverflowItems, KbqOverflowItemsResult } from '@koobiq/components/overflow-items';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';

/**
 * @title Overflow items as clamped list
 */
@Component({
    selector: 'overflow-items-as-clamped-list-example',
    imports: [
        KbqOverflowItems,
        KbqOverflowItem,
        KbqOverflowItemsResult,
        KbqLink,
        KbqTooltipTrigger
    ],
    template: `
        <div
            #overflowItemsContainer
            #kbqOverflowItems="kbqOverflowItems"
            kbqOverflowItems
            style="max-height: 48px; min-width: 60px"
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
            <span kbqOverflowItemsResult [kbqTooltip]="template" [kbqTooltipArrow]="false">
                and {{ kbqOverflowItems.hiddenItemIDs().size }}
            </span>

            <ng-template #template>
                @for (item of kbqOverflowItems.hiddenItemIDs().values(); track item) {
                    <span>
                        <span>{{ item }}</span>
                        @if (!$last) {
                            <span>,&nbsp;</span>
                        }
                    </span>
                }
            </ng-template>
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
            text-align: center;
            color: var(--kbq-foreground-contrast-secondary);
            user-select: none;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OverflowItemsAsClampedListExample {
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
}
