import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqClampedList, KbqClampedListTrigger } from '@koobiq/components/clamped-text';
import { KbqLink } from '@koobiq/components/link';
import { KbqOverflowItem, KbqOverflowItemsResult } from '@koobiq/components/overflow-items';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Clamped-list with overflow-based collapse
 */
@Component({
    selector: 'clamped-list-overflow-example',
    imports: [KbqBadgeModule, KbqClampedList, KbqClampedListTrigger, KbqLink, KbqOverflowItem, KbqOverflowItemsResult],
    template: `
        <div
            #list="kbqClampedList"
            data-testid="clamped-list-overflow"
            kbqClampedList
            class="example-list"
            mode="overflow"
            [wrap]="list.isCollapsed() ? 'nowrap' : 'wrap'"
            [items]="items"
            [collapsedVisibleCount]="10"
            [hiddenThreshold]="6"
        >
            @for (item of list.items(); track item) {
                <kbq-badge compact class="layout-margin-right-xxs" [kbqOverflowItem]="$index">
                    {{ t().itemLabel(item) }}
                </kbq-badge>
            }
            @if (list.hasToggle()) {
                <a kbqLink pseudo kbqClampedListTrigger kbqOverflowItemsResult>
                    {{ list.isCollapsed() ? list.showMoreCountText() : list.localeConfiguration().closeText }}
                </a>
            }
        </div>
    `,
    styles: `
        :host {
            display: block;
            padding-block: var(--kbq-size-xs);
        }

        .example-list {
            align-items: center;
            row-gap: var(--kbq-size-xxs);
            width: 360px;
            max-width: 100%;
            min-width: 150px;
            resize: horizontal;
        }

        .example-list > * {
            flex-shrink: 0;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClampedListOverflowExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
    protected readonly items = Array.from({ length: 30 }, (_, index) => index + 1);
}
