import { ChangeDetectionStrategy, Component, computed, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqSkeletonTabs } from '@koobiq/components/skeleton';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { injectExampleText } from '../l10n';

/**
 * @title Skeleton tabs preset
 */
@Component({
    selector: 'skeleton-tabs-example',
    imports: [KbqSkeletonTabs, KbqToggleModule, FormsModule, KbqTabsModule],
    template: `
        <kbq-toggle [(ngModel)]="loading">{{ text().loading }}</kbq-toggle>

        @if (loading()) {
            <kbq-skeleton-tabs contentLines="4" count="5" />
            <kbq-skeleton-tabs vertical count="4" contentLines="4" />
        } @else {
            <kbq-tab-group>
                @for (tab of tabs(); track tab.label) {
                    <kbq-tab [label]="tab.label">
                        <div class="example-tab-content">{{ tab.content }}</div>
                    </kbq-tab>
                }
            </kbq-tab-group>
            <kbq-tab-group vertical>
                @for (tab of tabs(); track tab.label) {
                    <kbq-tab [label]="tab.label">
                        <div class="example-tab-content">{{ tab.content }}</div>
                    </kbq-tab>
                }
            </kbq-tab-group>
        }
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-3xl);
            padding: var(--kbq-size-xl);
        }

        .example-tab-content {
            padding-block-start: var(--kbq-size-s);
        }

        kbq-tab-group[vertical] .example-tab-content {
            padding-block-start: 0;
            padding-inline-start: var(--kbq-size-s);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SkeletonTabsExample {
    protected readonly loading = model(true);

    protected readonly text = injectExampleText();
    protected readonly tabs = computed(() => this.text().tabs);
}
