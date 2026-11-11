import { ChangeDetectionStrategy, Component, computed, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqDd, KbqDl, KbqDt } from '@koobiq/components/dl';
import { KbqSkeletonDl } from '@koobiq/components/skeleton';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { injectExampleText } from '../l10n';

/**
 * @title Skeleton description list preset
 */
@Component({
    selector: 'skeleton-dl-example',
    imports: [KbqSkeletonDl, KbqToggleModule, FormsModule, KbqDl, KbqDt, KbqDd],
    template: `
        <kbq-toggle [(ngModel)]="loading">{{ text().loading }}</kbq-toggle>

        @if (loading()) {
            <kbq-skeleton-dl />
        } @else {
            <kbq-dl>
                @for (item of items(); track item.term) {
                    <kbq-dt>{{ item.term }}</kbq-dt>
                    <kbq-dd>{{ item.value }}</kbq-dd>
                }
            </kbq-dl>
        }
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-xl);
            padding: var(--kbq-size-xl);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonDlExample {
    protected readonly loading = model(true);

    protected readonly text = injectExampleText();
    protected readonly items = computed(() => this.text().dlItems);
}
