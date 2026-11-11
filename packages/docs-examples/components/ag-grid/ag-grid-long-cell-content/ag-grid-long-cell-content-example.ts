import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KbqAgGridThemeModule } from '@koobiq/ag-grid-angular-theme';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { PopUpPlacements, PopUpSizes } from '@koobiq/components/core';
import { KbqLink } from '@koobiq/components/link';
import { KbqOverflowItem, KbqOverflowItems, KbqOverflowItemsResult } from '@koobiq/components/overflow-items';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { AgGridModule, ICellRendererAngularComp } from 'ag-grid-angular';
import { AllCommunityModule, ColDef, ICellRendererParams, ModuleRegistry } from 'ag-grid-community';
import { filter, fromEvent } from 'rxjs';

import { injectExampleText as injectEventsText, injectExampleText } from './l10n';

ModuleRegistry.registerModules([AllCommunityModule]);

type ExampleRowData = {
    event: string;
    hosts: string[];
    techniques: string[];
    status: string;
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
    selector: 'example-overflow-badges-cell-renderer',
    imports: [KbqOverflowItems, KbqOverflowItem, KbqOverflowItemsResult, KbqBadgeModule, KbqLink],
    template: `
        @if (collapsed()) {
            <div #overflow="kbqOverflowItems" kbqOverflowItems wrap="wrap" class="example-hosts example-hosts_one-row">
                @for (host of hosts(); track host) {
                    <kbq-badge class="layout-margin-right-xxs" [kbqOverflowItem]="host">{{ host }}</kbq-badge>
                }
                <a kbqLink pseudo kbqOverflowItemsResult (click)="collapsed.set(false)">
                    {{ text().moreCount(overflow.hiddenItemIDs().size) }}
                </a>
            </div>
        } @else {
            <div class="example-hosts">
                @for (host of hosts(); track host) {
                    <kbq-badge class="layout-margin-right-xxs">{{ host }}</kbq-badge>
                }
            </div>
            <a kbqLink pseudo (click)="collapsed.set(true)">{{ text().collapseLink }}</a>
        }
    `,
    styles: `
        :host {
            display: block;
            padding-block: var(--kbq-size-xs);
        }

        .example-hosts {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            row-gap: var(--kbq-size-xxs);
        }

        /* One row of badges: the directive hides what does not fit into it and shows the trigger instead. */
        .example-hosts_one-row {
            max-height: var(--kbq-size-xxl);
        }

        .kbq-overflow-items-result {
            white-space: nowrap;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleOverflowBadgesCellRenderer implements ICellRendererAngularComp {
    // Only the collapsed cell has the directive, hence the optional query.
    private readonly overflowItems = viewChild(KbqOverflowItems);
    private readonly destroyRef = inject(DestroyRef);

    protected readonly text = injectExampleText();

    protected readonly hosts = signal<string[]>([]);
    protected readonly collapsed = signal(true);

    agInit(params: ICellRendererParams<ExampleRowData, string[]>): void {
        this.hosts.set(params.value ?? []);
        onCellEnter(params.eGridCell, this.destroyRef, () => {
            // A collapsed cell with everything already visible has nothing to expand.
            if (this.collapsed() && !this.overflowItems()?.hiddenItemIDs().size) return;

            this.collapsed.update((state) => !state);
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
                    kbqLink
                    target="_blank"
                    rel="noopener noreferrer"
                    [kbqOverflowItem]="technique.id"
                    [href]="technique.url"
                    [class.layout-margin-right-s]="!$last"
                >
                    {{ technique.id }}
                </a>
            }
            <a
                kbqLink
                pseudo
                role="button"
                kbqOverflowItemsResult
                kbqPopover
                [kbqPopoverContent]="allTechniquesContent"
                [kbqPopoverSize]="popUpSizes.Small"
                [kbqPopoverPlacement]="popUpPlacements.BottomRight"
                [kbqPopoverPlacementPriority]="popoverPlacementPriority"
                [kbqPopoverArrow]="false"
                [(kbqPopoverVisible)]="popoverVisible"
            >
                {{ text().allCount(techniques().length) }}
            </a>
        </div>

        <ng-template #allTechniquesContent>
            <div class="example-all-techniques">
                @for (technique of techniques(); track technique.id) {
                    <a kbqLink target="_blank" rel="noopener noreferrer" [href]="technique.url">{{ technique.id }}</a>
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

        .example-all-techniques {
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

    protected readonly text = injectExampleText();

    protected readonly popUpSizes = PopUpSizes;
    protected readonly popUpPlacements = PopUpPlacements;
    // Right edge of the panel follows the trigger: under it, and above when there is no room below.
    protected readonly popoverPlacementPriority = [PopUpPlacements.BottomRight, PopUpPlacements.TopRight];
    protected readonly popoverVisible = signal(false);
    protected readonly techniques = signal<ExampleTechnique[]>([]);

    agInit(params: ICellRendererParams<ExampleRowData, string[]>): void {
        this.setTechniques(params.value);
        onCellEnter(params.eGridCell, this.destroyRef, () => {
            if (this.overflowItems().hiddenItemIDs().size) this.popoverVisible.set(true);
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
 * @title AG Grid with overflow items
 */
@Component({
    selector: 'ag-grid-long-cell-content-example',
    imports: [AgGridModule, KbqAgGridThemeModule],
    template: `
        <ag-grid-angular
            kbqAgGridTheme
            kbqAgGridThemeDisableCellFocusStyles
            [style.height.px]="400"
            [columnDefs]="columnDefs()"
            [rowData]="rowData()"
        />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridLongCellContentExample {
    private readonly events = injectEventsText();

    protected readonly columnDefs = computed<ColDef<ExampleRowData>[]>(() => [
        {
            field: 'event',
            headerName: this.events().eventHeader,
            flex: 1,
            minWidth: 150
        },
        {
            field: 'hosts',
            headerName: this.events().hostsHeader,
            width: 220,
            minWidth: 140,
            sortable: false,
            valueFormatter: ({ value }) => value?.join(', ') ?? '',
            cellRenderer: ExampleOverflowBadgesCellRenderer,
            autoHeight: true
        },
        {
            field: 'techniques',
            headerName: this.events().techniquesHeader,
            width: 240,
            minWidth: 140,
            sortable: false,
            valueFormatter: ({ value }) => value?.join(', ') ?? '',
            cellRenderer: ExampleOverflowLinksCellRenderer
        },
        {
            field: 'status',
            headerName: this.events().statusHeader,
            flex: 1,
            minWidth: 120
        }
    ]);

    // Repeats of the events above, enough rows to scroll and to see the grid recalculate the cells it renders.
    protected readonly rowData = computed<ExampleRowData[]>(() =>
        Array.from({ length: 100 }, (_, index) => {
            const event = this.events().events[index % this.events().events.length];

            return { ...event, event: `${event.event} ${index + 1}` };
        })
    );
}
