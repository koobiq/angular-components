import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal, viewChild } from '@angular/core';
import { AgGridModule, type ICellRendererAngularComp } from 'ag-grid-angular';
import { AllCommunityModule, type ColDef, type ICellRendererParams, ModuleRegistry } from 'ag-grid-community';
import { KbqAgGridThemeModule } from '@koobiq/ag-grid-angular-theme';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { PopUpPlacements, PopUpSizes } from '@koobiq/components/core';
import { KbqLink } from '@koobiq/components/link';
import { KbqOverflowItem, KbqOverflowItems, KbqOverflowItemsResult } from '@koobiq/components/overflow-items';
import { KbqPopoverModule } from '@koobiq/components/popover';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { exampleOnCellEnter } from '../cell-keyboard';
import { ExampleIncidentBadgeCell } from '../incident-cells';
import {
    exampleGetIncidents,
    type ExampleSecurityIncident,
    type ExampleTechniqueId,
    exampleTechniqueLabel,
    exampleTechniqueUrl
} from '../security-incidents';
import { TRANSLATIONS } from './l10n';

ModuleRegistry.registerModules([AllCommunityModule]);

type ExampleTechnique = {
    id: string;
    url: string;
    label: string;
};

@Component({
    selector: 'example-overflow-badges-cell-renderer',
    imports: [KbqOverflowItems, KbqOverflowItem, KbqOverflowItemsResult, KbqBadgeModule, KbqLink],
    template: `
        @if (collapsed()) {
            <div #overflow="kbqOverflowItems" kbqOverflowItems class="example-hosts">
                @for (host of hosts(); track host) {
                    <kbq-badge compact class="layout-margin-right-xxs" [kbqOverflowItem]="host">{{ host }}</kbq-badge>
                }
                <a kbqLink pseudo kbqOverflowItemsResult (click)="collapsed.set(false)">
                    {{ t().moreCount(overflow.hiddenItemIDs().size) }}
                </a>
            </div>
        } @else {
            <div class="example-hosts example-hosts_expanded">
                @for (host of hosts(); track host) {
                    <kbq-badge compact class="layout-margin-right-xxs">{{ host }}</kbq-badge>
                }
            </div>
            <a kbqLink pseudo (click)="collapsed.set(true)">{{ t().collapseLink }}</a>
        }
    `,
    styles: `
        :host {
            display: block;
            padding-block: var(--kbq-size-xs);
        }

        .example-hosts {
            display: flex;
            align-items: center;
            row-gap: var(--kbq-size-xxs);
        }

        .example-hosts_expanded {
            flex-wrap: wrap;
        }

        .example-hosts > * {
            flex-shrink: 0;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleOverflowBadgesCellRenderer implements ICellRendererAngularComp {
    // Only the collapsed cell has the directive, hence the optional query.
    private readonly overflowItems = viewChild(KbqOverflowItems);
    private readonly destroyRef = inject(DestroyRef);

    protected readonly hosts = signal<string[]>([]);
    protected readonly collapsed = signal(true);
    protected readonly t = injectTranslation(TRANSLATIONS);

    agInit(params: ICellRendererParams<ExampleSecurityIncident, string[]>): void {
        this.hosts.set(params.value ?? []);
        exampleOnCellEnter(params.eGridCell, this.destroyRef, () => {
            // A collapsed cell with everything already visible has nothing to expand.
            if (this.collapsed() && !this.overflowItems()?.hiddenItemIDs().size) return;

            this.collapsed.update((state) => !state);
        });
    }

    refresh(params: ICellRendererParams<ExampleSecurityIncident, string[]>): boolean {
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
                    [attr.aria-label]="technique.label"
                    [title]="technique.label"
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
                {{ t().allCount(techniques().length) }}
            </a>
        </div>

        <ng-template #allTechniquesContent>
            <div class="example-all-techniques">
                @for (technique of techniques(); track technique.id) {
                    <a kbqLink target="_blank" rel="noopener noreferrer" [href]="technique.url">
                        {{ technique.label }}
                    </a>
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

    protected readonly t = injectTranslation(TRANSLATIONS);
    protected readonly popUpSizes = PopUpSizes;
    protected readonly popUpPlacements = PopUpPlacements;
    // Right edge of the panel follows the trigger: under it, and above when there is no room below.
    protected readonly popoverPlacementPriority = [PopUpPlacements.BottomRight, PopUpPlacements.TopRight];
    protected readonly popoverVisible = signal(false);
    protected readonly techniques = signal<ExampleTechnique[]>([]);

    agInit(params: ICellRendererParams<ExampleSecurityIncident, ExampleTechniqueId[]>): void {
        this.setTechniques(params.value);
        exampleOnCellEnter(params.eGridCell, this.destroyRef, () => {
            if (this.overflowItems().hiddenItemIDs().size) this.popoverVisible.set(true);
        });
    }

    refresh(params: ICellRendererParams<ExampleSecurityIncident, ExampleTechniqueId[]>): boolean {
        this.setTechniques(params.value);

        return true;
    }

    private setTechniques(ids: ExampleTechniqueId[] | null | undefined): void {
        this.techniques.set(
            (ids ?? []).map((id) => ({ id, url: exampleTechniqueUrl(id), label: exampleTechniqueLabel(id) }))
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
            [rowData]="rowData"
        />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgGridLongCellContentExample {
    private readonly t = injectTranslation(TRANSLATIONS);

    protected readonly columnDefs = computed<ColDef<ExampleSecurityIncident>[]>(() => [
        {
            field: 'event',
            headerName: this.t().eventHeader,
            flex: 1,
            minWidth: 150
        },
        {
            field: 'hosts',
            headerName: this.t().hostsHeader,
            width: 220,
            minWidth: 140,
            sortable: false,
            valueFormatter: ({ value }) => value?.join(', ') ?? '',
            cellRenderer: ExampleOverflowBadgesCellRenderer,
            autoHeight: true
        },
        {
            field: 'techniques',
            headerName: this.t().techniquesHeader,
            width: 240,
            minWidth: 140,
            sortable: false,
            valueFormatter: ({ value }) => value?.join(', ') ?? '',
            cellRenderer: ExampleOverflowLinksCellRenderer
        },
        {
            field: 'status',
            cellRenderer: ExampleIncidentBadgeCell,
            headerName: this.t().statusHeader,
            flex: 1,
            minWidth: 120
        }
    ]);

    protected readonly rowData = exampleGetIncidents();
}
