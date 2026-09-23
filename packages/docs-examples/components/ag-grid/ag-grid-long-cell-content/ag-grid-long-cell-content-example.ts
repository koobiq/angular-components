import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqAgGridThemeModule } from '@koobiq/ag-grid-angular-theme';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqClampedList, KbqClampedListTrigger } from '@koobiq/components/clamped-text';
import { kbqLocaleIDProvider, kbqLocaleServiceProvider, PopUpSizes } from '@koobiq/components/core';
import { KbqLink } from '@koobiq/components/link';
import { KbqOverflowItem, KbqOverflowItems, KbqOverflowItemsResult } from '@koobiq/components/overflow-items';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { AgGridModule, ICellRendererAngularComp } from 'ag-grid-angular';
import { AllCommunityModule, ColDef, ICellRendererParams, ModuleRegistry } from 'ag-grid-community';
import { filter, fromEvent } from 'rxjs';

ModuleRegistry.registerModules([AllCommunityModule]);

type ExampleRowData = {
    event: string;
    hosts: string[];
    techniques: string[];
};

type ExampleTechnique = {
    id: string;
    url: string;
};

// The grid keeps focus on the cell itself and Tab never reaches the controls inside it,
// so Enter on the focused cell is handled instead.
const onCellEnter = (cell: HTMLElement, destroyRef: DestroyRef, callback: (event: KeyboardEvent) => void): void => {
    fromEvent<KeyboardEvent>(cell, 'keydown')
        .pipe(
            filter(({ key, target }) => key === 'Enter' && target === cell),
            takeUntilDestroyed(destroyRef)
        )
        .subscribe(callback);
};

@Component({
    selector: 'example-clamped-list-cell-renderer',
    imports: [KbqClampedList, KbqClampedListTrigger, KbqBadgeModule, KbqLink],
    template: `
        <div
            #clampedList="kbqClampedList"
            kbqClampedList
            class="example-clamped-list"
            collapsedVisibleCount="2"
            hiddenThreshold="2"
            [items]="hosts()"
        >
            @for (host of clampedList.visibleItems(); track host) {
                <kbq-badge>{{ host }}</kbq-badge>
            }
            @if (clampedList.hasToggle()) {
                <a kbq-link pseudo noUnderline role="button" kbqClampedListTrigger>
                    @if (clampedList.isCollapsed()) {
                        {{ clampedList.exceededItemCount() }} {{ clampedList.localeConfiguration().moreText }}
                    } @else {
                        {{ clampedList.localeConfiguration().closeText }}
                    }
                </a>
            }
        </div>
    `,
    styles: `
        :host {
            display: block;
            padding-block: var(--kbq-size-xs);
        }

        .example-clamped-list {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: var(--kbq-size-xxs);
        }

        .kbq-clamped-list__trigger {
            margin-top: 0;
            align-self: center;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleClampedListCellRenderer implements ICellRendererAngularComp {
    private readonly clampedList = viewChild.required(KbqClampedList);
    private readonly destroyRef = inject(DestroyRef);

    protected readonly hosts = signal<string[]>([]);

    agInit(params: ICellRendererParams<ExampleRowData, string[]>): void {
        this.hosts.set(params.value ?? []);
        onCellEnter(params.eGridCell, this.destroyRef, (event) => {
            if (this.clampedList().hasToggle()) this.clampedList().toggle(event);
        });
    }

    refresh(params: ICellRendererParams<ExampleRowData, string[]>): boolean {
        this.hosts.set(params.value ?? []);

        return true;
    }
}

@Component({
    selector: 'example-overflow-links-cell-renderer',
    imports: [KbqOverflowItems, KbqOverflowItem, KbqOverflowItemsResult, KbqLink, KbqPopoverModule],
    template: `
        <div #overflow="kbqOverflowItems" kbqOverflowItems>
            @for (technique of techniques(); track technique.id) {
                <a
                    kbq-link
                    target="_blank"
                    [kbqOverflowItem]="technique.id"
                    [href]="technique.url"
                    [class.layout-margin-right-s]="!$last"
                >
                    {{ technique.id }}
                </a>
            }
            <a
                kbq-link
                pseudo
                noUnderline
                role="button"
                kbqOverflowItemsResult
                kbqPopover
                [kbqPopoverContent]="hiddenTechniquesContent"
                [kbqPopoverSize]="popUpSizes.Small"
                [(kbqPopoverVisible)]="popoverVisible"
            >
                All {{ overflow.hiddenItemIDs().size }}
            </a>
        </div>

        <ng-template #hiddenTechniquesContent>
            <div class="example-hidden-techniques">
                @for (technique of hiddenTechniques(); track technique.id) {
                    <a kbq-link target="_blank" [href]="technique.url">{{ technique.id }}</a>
                }
            </div>
        </ng-template>
    `,
    styles: `
        :host {
            display: block;
            padding-block: var(--kbq-size-s);
            line-height: var(--kbq-typography-text-normal-line-height);
        }

        .example-hidden-techniques {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: var(--kbq-size-xs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleOverflowLinksCellRenderer implements ICellRendererAngularComp {
    private readonly overflowItems = viewChild.required(KbqOverflowItems);
    private readonly destroyRef = inject(DestroyRef);

    protected readonly popUpSizes = PopUpSizes;
    protected readonly popoverVisible = signal(false);
    protected readonly techniques = signal<ExampleTechnique[]>([]);
    protected readonly hiddenTechniques = computed(() => {
        const hiddenIDs = this.overflowItems().hiddenItemIDs();

        return this.techniques().filter(({ id }) => hiddenIDs.has(id));
    });

    agInit(params: ICellRendererParams<ExampleRowData, string[]>): void {
        this.setTechniques(params.value);
        onCellEnter(params.eGridCell, this.destroyRef, () => {
            if (this.hiddenTechniques().length) this.popoverVisible.set(true);
        });
    }

    refresh(params: ICellRendererParams<ExampleRowData, string[]>): boolean {
        this.setTechniques(params.value);

        return true;
    }

    private setTechniques(ids: string[] | null | undefined): void {
        // A sub-technique page is nested under its parent: T1110.001 lives at /techniques/T1110/001/.
        this.techniques.set(
            (ids ?? []).map((id) => ({ id, url: `https://attack.mitre.org/techniques/${id.replace('.', '/')}/` }))
        );
    }
}

/**
 * @title AG Grid with clamped list and overflow items
 */
@Component({
    selector: 'ag-grid-long-cell-content-example',
    imports: [AgGridModule, KbqAgGridThemeModule],
    template: `
        <ag-grid-angular
            kbqAgGridTheme
            kbqAgGridThemeDisableCellFocusStyles
            [style.height.px]="400"
            [columnDefs]="columnDefs"
            [rowData]="rowData"
        />
    `,
    providers: [kbqLocaleIDProvider('en-US'), kbqLocaleServiceProvider()],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridLongCellContentExample {
    protected readonly columnDefs: ColDef<ExampleRowData>[] = [
        {
            field: 'event',
            headerName: 'Event',
            flex: 1,
            minWidth: 150
        },
        {
            field: 'hosts',
            headerName: 'Hosts (Clamped list)',
            width: 220,
            minWidth: 220,
            sortable: false,
            valueFormatter: ({ value }) => value.join(', '),
            cellRenderer: ExampleClampedListCellRenderer,
            autoHeight: true
        },
        {
            field: 'techniques',
            headerName: 'Techniques (Overflow items)',
            width: 240,
            minWidth: 240,
            sortable: false,
            valueFormatter: ({ value }) => value.join(', '),
            cellRenderer: ExampleOverflowLinksCellRenderer
        }
    ];

    protected readonly rowData: ExampleRowData[] = [
        {
            event: 'Brute force attack',
            hosts: ['srv-01', 'srv-02', 'srv-03', 'srv-04', 'srv-05', 'srv-06', 'srv-07'],
            techniques: ['T1110', 'T1110.001', 'T1110.003', 'T1110.004', 'T1078', 'T1021.004']
        },
        {
            event: 'Port scanning',
            hosts: ['gw-01'],
            techniques: ['T1046']
        },
        {
            event: 'Malware detected',
            hosts: ['ws-12', 'ws-15', 'ws-21'],
            techniques: ['T1566.001', 'T1204.002', 'T1027']
        },
        {
            event: 'Obfuscated script',
            hosts: ['ws-03', 'ws-04'],
            techniques: ['T1059.001', 'T1027.010', 'T1140']
        },
        {
            event: 'Data exfiltration',
            hosts: ['db-01', 'db-02', 'db-03', 'db-04', 'db-05', 'db-06', 'db-07', 'db-08', 'db-09'],
            techniques: ['T1567.002', 'T1048', 'T1030', 'T1041', 'T1020']
        },
        {
            event: 'DNS tunneling',
            hosts: ['dns-01', 'dns-02'],
            techniques: ['T1071.004', 'T1572']
        },
        {
            event: 'Privilege escalation',
            hosts: ['ws-01', 'ws-02', 'ws-05', 'ws-06', 'ws-08', 'ws-09'],
            techniques: ['T1098', 'T1078.002', 'T1078.003', 'T1021.002']
        },
        {
            event: 'Phishing email',
            hosts: ['mail-01', 'mail-02', 'mail-03', 'mail-04'],
            techniques: ['T1566.002', 'T1598.003', 'T1056.003', 'T1583.001']
        }
    ];
}
