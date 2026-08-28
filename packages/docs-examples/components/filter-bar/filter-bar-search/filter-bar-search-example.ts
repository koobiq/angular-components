import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { createSearchPredicate } from '@koobiq/components/core';
import { KbqFilter, KbqFilterBarModule, KbqPipe, KbqPipeTypes } from '@koobiq/components/filter-bar';

interface Network {
    name: string;
    description: string;
}

/** Text search is the first pipe in every filter: always present, never removable. */
const createSearchPipe = (): KbqPipe => ({
    name: 'Поиск',
    type: KbqPipeTypes.Input,
    value: null,

    cleanable: true,
    removable: false,
    disabled: false
});

/**
 * @title Filter-bar search
 */
@Component({
    selector: 'filter-bar-search-example',
    imports: [KbqFilterBarModule],
    template: `
        <kbq-filter-bar [filter]="activeFilter()" (filterChange)="onFilterChange($event)">
            @for (pipe of activeFilter()?.pipes; track pipe) {
                <ng-container *kbqPipe="pipe" />
            }
        </kbq-filter-bar>

        <ul class="network-list">
            @for (network of filteredNetworks(); track network.name) {
                <li>
                    <strong>{{ network.name }}</strong>
                    <span>{{ network.description }}</span>
                </li>
            } @empty {
                <li>Nothing found</li>
            }
        </ul>
    `,
    styles: `
        .network-list {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-s);
            margin: var(--kbq-size-m) 0 0;
            padding: 0;
            list-style: none;
        }

        .network-list li {
            display: flex;
            gap: var(--kbq-size-s);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterBarSearchExample {
    readonly networks: Network[] = [
        { name: '10.125.123.0/24 - all', description: 'Development network' },
        { name: '10.125.10.0/24 - admin', description: 'Admin network' },
        { name: '10.125.11.0/24 - guest', description: 'Guest network with limited access' },
        { name: '172.16.0.0/16 - office', description: 'Main office network' },
        { name: '192.168.1.0/24 - lab', description: 'Testing laboratory' },
        { name: 'Café Wi-Fi guest network', description: 'Guest cafe wireless network' }
    ];

    readonly activeFilter = signal<KbqFilter>(this.getDefaultFilter());

    readonly filteredNetworks = computed(() => {
        const query = (this.activeFilter()?.pipes[0]?.value as string | null) ?? '';
        const predicate = createSearchPredicate(query);

        return this.networks.filter((network) => predicate([network.name, network.description]));
    });

    onFilterChange(filter: KbqFilter | null) {
        if (!filter) return;

        this.activeFilter.set(filter);
    }

    getDefaultFilter(): KbqFilter {
        return {
            name: '',
            readonly: false,
            disabled: false,
            changed: false,
            saved: false,
            pipes: [createSearchPipe()]
        };
    }
}
