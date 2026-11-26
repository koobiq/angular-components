import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqClampedList, KbqClampedListTrigger } from '@koobiq/components/clamped-text';
import { KbqOverflowItem, KbqOverflowItemsResult } from '@koobiq/components/overflow-items';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Clamped-list with overflow-based collapse
 */
@Component({
    selector: 'clamped-list-overflow-example',
    imports: [KbqClampedList, KbqClampedListTrigger, KbqOverflowItem, KbqOverflowItemsResult],
    template: `
        <div
            #list="kbqClampedList"
            data-testid="clamped-list-overflow"
            kbqClampedList
            mode="overflow"
            wrap="wrap"
            style="width: 360px; max-width: 100%; max-height: 48px; min-width: 150px; resize: horizontal"
            [items]="countries()"
            [collapsedVisibleCount]="10"
            [hiddenThreshold]="6"
        >
            @for (item of list.items(); track item) {
                <span [kbqOverflowItem]="$index">{{ item }}</span>
            }
            @if (list.hasToggle()) {
                <span kbqClampedListTrigger kbqOverflowItemsResult>
                    {{ list.isCollapsed() ? list.showMoreCountText() : list.localeConfiguration().closeText }}
                </span>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClampedListOverflowExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
    protected readonly countries = computed(() => this.t().countries);
}
