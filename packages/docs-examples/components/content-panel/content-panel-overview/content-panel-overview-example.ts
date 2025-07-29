import { ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, inject, model, output, signal } from '@angular/core';
import { KbqAgGridTheme } from '@koobiq/ag-grid-angular-theme';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqContentPanelModule } from '@koobiq/components/content-panel';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqModalModule, KbqModalRef, KbqModalService } from '@koobiq/components/modal';
import { AgGridModule } from 'ag-grid-angular';
import {
    CellClickedEvent,
    CellFocusedEvent,
    CellKeyDownEvent,
    ColDef,
    FirstDataRenderedEvent,
    FullWidthCellKeyDownEvent
} from 'ag-grid-community';

type ExampleRowData = Record<string, string>;

@Component({
    standalone: true,
    imports: [AgGridModule, KbqAgGridTheme],
    selector: 'example-grid',
    template: `
        <ag-grid-angular
            [style.height]="'100%'"
            [columnDefs]="columnDefs"
            [defaultColDef]="defaultColDef"
            [rowData]="rowData"
            [suppressRowClickSelection]="true"
            (firstDataRendered)="onFirstDataRendered($event)"
            (cellClicked)="cellClicked.emit($event)"
            (cellFocused)="cellFocused.emit($event)"
            (cellKeyDown)="cellKeyDown.emit($event)"
            rowSelection="multiple"
            kbqAgGridTheme
            disableCellFocusStyles
        />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleGrid {
    readonly cellClicked = output<CellClickedEvent>();
    readonly cellFocused = output<CellFocusedEvent>();
    readonly cellKeyDown = output<CellKeyDownEvent | FullWidthCellKeyDownEvent>();

    protected readonly defaultColDef: ColDef = {
        sortable: true,
        resizable: true,
        width: 140
    };

    private readonly _columnDefs: ColDef[] = Array.from({ length: 20 }, (_, index) => ({
        headerName: 'Test ',
        field: 'column' + index
    }));

    protected readonly columnDefs: ColDef[] = [
        {
            headerCheckboxSelection: true,
            checkboxSelection: true,
            width: 34,
            headerName: '',
            sortable: false,
            filter: false,
            resizable: false,
            suppressMovable: true,
            editable: false,
            lockPosition: true
        },
        ...this._columnDefs

    ];

    protected readonly rowData: ExampleRowData[] = Array.from({ length: 1000 }, (_, index) => {
        return this._columnDefs.reduce((prev, _cur, i) => {
            prev['column' + i] = 'Text ' + index;

            return prev;
        }, {} as ExampleRowData);
    });

    protected onFirstDataRendered({ api }: FirstDataRenderedEvent): void {
        api.forEachNode((node) => {
            if (node.rowIndex === 3 || node.rowIndex === 4) {
                node.setSelected(true);
            }
        });
    }
}

@Component({
    standalone: true,
    imports: [
        KbqButtonModule,
        KbqBadgeModule,
        KbqLinkModule,
        KbqIconModule,
        KbqContentPanelModule,
        KbqModalModule,
        ExampleGrid
    ],
    selector: 'example-content-panel',
    template: `
        <kbq-modal-title class="example-modal-title">
            <div>Page Title</div>
            <div class="example-modal-title-actions">
                <button [color]="componentColors.Contrast" (click)="modalRef.close()" kbq-button>Close window</button>
                <button [color]="componentColors.Contrast" [kbqStyle]="buttonStyles.Transparent" kbq-button>
                    <i kbq-icon="kbq-ellipsis-horizontal_16"></i>
                </button>
            </div>
        </kbq-modal-title>
        <kbq-modal-body class="example-modal-body">
            <kbq-content-panel-container class="example-content-panel-container" [(opened)]="opened">
                <example-grid
                    (cellClicked)="onGridCellClicked($event)"
                    (cellFocused)="onGridCellFocused($event)"
                    (cellKeyDown)="onGridCellKeyDown($event)"
                />
                <kbq-content-panel>
                    <kbq-content-panel-aside>
                        @for (_i of [0, 1, 2, 3]; track $index) {
                            <button
                                [class.kbq-active]="$index === 0"
                                [color]="componentColors.Contrast"
                                [kbqStyle]="buttonStyles.Transparent"
                                kbq-button
                            >
                                <i kbq-icon="kbq-bug_16"></i>
                            </button>
                        }
                    </kbq-content-panel-aside>
                    <kbq-content-panel-header>
                        <div class="example-content-header-title" kbqContentPanelHeaderTitle>
                            <span>Selected row {{ selectedRowIndex() }}</span>
                            <kbq-badge [badgeColor]="badgeColors.FadeError">8,6</kbq-badge>
                            <a kbq-link pseudo>July 21, 2025 2:29 PM</a>
                        </div>
                        <div class="example-content-header-actions" kbqContentPanelHeaderActions>
                            <button [color]="componentColors.Contrast" [kbqStyle]="buttonStyles.Transparent" kbq-button>
                                <i kbq-icon="kbq-link_16"></i>
                            </button>
                            <button [color]="componentColors.Contrast" [kbqStyle]="buttonStyles.Transparent" kbq-button>
                                <i kbq-icon="kbq-arrows-expand-diagonal_16"></i>
                            </button>
                            <button [color]="componentColors.Contrast" [kbqStyle]="buttonStyles.Transparent" kbq-button>
                                <i kbq-icon="kbq-ellipsis-vertical_16"></i>
                            </button>
                        </div>
                        <div class="example-content-header-caption">Caption</div>
                        <div class="example-content-header-buttons">
                            <button [color]="componentColors.ContrastFade" kbq-button>
                                <i kbq-icon="kbq-pencil_16"></i>
                                Edit
                            </button>
                            <button [color]="componentColors.ContrastFade" kbq-button>
                                <i kbq-icon="kbq-square-multiple-o_16"></i>
                                Copy
                            </button>
                            <button [color]="componentColors.ContrastFade" kbq-button>
                                <i kbq-icon="kbq-trash_16"></i>
                                Delete
                            </button>
                        </div>
                    </kbq-content-panel-header>
                    <kbq-content-panel-body class="example-content-panel-body">
                        @for (_i of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; track $index) {
                            <p>
                                In computing [{{ $index }}], a denial-of-service attack (DoS attack) is a cyber-attack
                                in which the perpetrator seeks to make a machine or network resource unavailable to its
                                intended users by temporarily or indefinitely disrupting services of a host connected to
                                a network. Denial of service is typically accomplished by flooding the targeted machine
                                or resource with superfluous requests in an attempt to overload systems and prevent some
                                or all legitimate requests from being fulfilled. The range of attacks varies widely,
                                spanning from inundating a server with millions of requests to slow its performance,
                                overwhelming a server with a substantial amount of invalid data, to submitting requests
                                with an illegitimate IP address.
                            </p>
                        }
                    </kbq-content-panel-body>
                    <kbq-content-panel-footer class="example-content-panel-footer">
                        <button [color]="componentColors.Contrast" kbq-button>Button 0</button>
                        <button [color]="componentColors.ContrastFade" kbq-button>Button 1</button>
                        <button [color]="componentColors.ContrastFade" kbq-button>Button 2</button>
                    </kbq-content-panel-footer>
                </kbq-content-panel>
            </kbq-content-panel-container>
        </kbq-modal-body>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            height: 90vh;
        }

        .example-modal-body {
            height: 100%;
            max-height: unset;
        }

        .example-modal-body:has(.kbq-content-panel-container__opened) {
            padding-right: 0;
        }

        ::ng-deep .example-modal-title {
            padding: var(--kbq-size-xl) var(--kbq-size-xxl);
        }

        ::ng-deep .example-modal-title .kbq-modal-title {
            display: flex;
            justify-content: space-between;
            width: 100%;
        }

        .example-modal-title-actions {
            display: flex;
            gap: var(--kbq-size-s);
        }

        .example-content-panel-container {
            display: flex;
            max-height: unset;
        }

        .example-content-header-caption {
            color: var(--kbq-foreground-contrast-secondary);
            margin-top: var(--kbq-size-xxs);
            margin-bottom: var(--kbq-size-l);
        }

        .example-content-header-buttons {
            display: flex;
            gap: var(--kbq-size-l);
        }

        .example-content-header-title {
            display: flex;
            align-items: center;
            gap: var(--kbq-size-s);
        }

        .example-content-header-title > span,
        .example-content-header-title > a {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .example-content-panel-body > p {
            margin-top: 0;
        }

        .example-content-panel-footer {
            display: flex;
            gap: var(--kbq-size-l);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleContentPanel {
    protected readonly modalRef = inject(KbqModalRef);
    protected readonly componentColors = KbqComponentColors;
    protected readonly buttonStyles = KbqButtonStyles;
    protected readonly badgeColors = KbqBadgeColors;

    protected readonly selectedRowIndex = signal(0);
    protected readonly opened = model(false);

    protected onGridCellClicked({ rowIndex }: CellClickedEvent): void {
        this.selectedRowIndex.set(rowIndex!);
        this.opened.set(true);
    }

    protected onGridCellFocused(event: CellFocusedEvent): void {
        if (this.opened()) this.selectedRowIndex.set(event.rowIndex!);
    }

    protected onGridCellKeyDown({ rowIndex, event }: CellKeyDownEvent | FullWidthCellKeyDownEvent): void {
        if (event instanceof KeyboardEvent && event.keyCode === ENTER) {
            this.selectedRowIndex.set(rowIndex!);
            this.opened.set(true);
        }
    }
}

/**
 * @title Content Panel overview
 */
@Component({
    standalone: true,
    imports: [KbqButtonModule, KbqModalModule],
    selector: 'content-panel-overview-example',
    template: `
        <button (click)="openModal()" kbq-button>Show example</button>
    `,
    styles: `
        :host {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 160px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentPanelOverviewExample {
    private readonly modal = inject(KbqModalService);

    openModal(): void {
        this.modal.open({
            kbqComponent: ExampleContentPanel,
            kbqWidth: '90vw',
            kbqCloseByESC: false,
            kbqClosable: false
        });
    }
}
