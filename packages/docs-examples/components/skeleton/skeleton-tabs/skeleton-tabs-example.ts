import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqSkeletonTabs } from '@koobiq/components/skeleton';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Skeleton tabs preset
 */
@Component({
    selector: 'skeleton-tabs-example',
    imports: [KbqSkeletonTabs, KbqToggleModule, FormsModule, KbqTabsModule],
    template: `
        <kbq-toggle [(ngModel)]="loading">Loading</kbq-toggle>

        @if (loading()) {
            <kbq-skeleton-tabs contentLines="4" count="5" />
            <kbq-skeleton-tabs vertical count="4" contentLines="4" />
        } @else {
            <kbq-tab-group>
                @for (tab of tabs; track tab.label) {
                    <kbq-tab [label]="tab.label">
                        <div class="example-tab-content">{{ tab.content }}</div>
                    </kbq-tab>
                }
            </kbq-tab-group>
            <kbq-tab-group vertical>
                @for (tab of tabs; track tab.label) {
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
    protected readonly tabs = [
        {
            label: 'Overview',
            content:
                'In computing, a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator seeks to make a machine or network resource unavailable to its intended users by temporarily or indefinitely disrupting services of a host connected to a network.'
        },
        {
            label: 'Sources',
            content:
                'In a distributed denial-of-service attack (DDoS attack), the incoming traffic flooding the victim originates from many different sources.'
        },
        {
            label: 'Mitigation',
            content: 'Simply attempting to block a single source is insufficient, as there are multiple sources.'
        }
    ];
}
