import { ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, computed, inject, model, output, signal } from '@angular/core';
import { KbqAgGridThemeModule } from '@koobiq/ag-grid-angular-theme';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqContentPanelModule } from '@koobiq/components/content-panel';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLink } from '@koobiq/components/link';
import { KbqModalModule, KbqModalRef, KbqModalService } from '@koobiq/components/modal';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { AgGridModule } from 'ag-grid-angular';
import {
    AllCommunityModule,
    CellClickedEvent,
    CellFocusedEvent,
    CellKeyDownEvent,
    ColDef,
    FirstDataRenderedEvent,
    FullWidthCellKeyDownEvent,
    ModuleRegistry,
    RowSelectionOptions
} from 'ag-grid-community';
import { TRANSLATIONS } from './l10n';

ModuleRegistry.registerModules([AllCommunityModule]);

type ExampleRowData = Record<string, string>;

@Component({
    selector: 'example-grid',
    imports: [AgGridModule, KbqAgGridThemeModule],
    template: `
        <ag-grid-angular
            kbqAgGridTheme
            kbqAgGridThemeDisableCellFocusStyles
            kbqAgGridSelectRowsByShiftClick
            kbqAgGridToNextRowByTab
            kbqAgGridSelectRowsByShiftArrow
            kbqAgGridSelectRowsByCtrlClick
            [alwaysMultiSort]="true"
            [rowSelection]="rowSelection"
            [style.height]="'100%'"
            [columnDefs]="columnDefs()"
            [defaultColDef]="defaultColDef"
            [rowData]="rowData()"
            (firstDataRendered)="onFirstDataRendered($event)"
            (cellClicked)="cellClicked.emit($event)"
            (cellFocused)="cellFocused.emit($event)"
            (cellKeyDown)="cellKeyDown.emit($event)"
        />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleGrid {
    protected readonly t = injectTranslation(TRANSLATIONS);

    readonly cellClicked = output<CellClickedEvent>();
    readonly cellFocused = output<CellFocusedEvent>();
    readonly cellKeyDown = output<CellKeyDownEvent | FullWidthCellKeyDownEvent>();

    protected readonly defaultColDef: ColDef = {
        sortable: true,
        resizable: true,
        width: 140
    };

    protected readonly rowSelection: RowSelectionOptions = {
        mode: 'multiRow',
        headerCheckbox: true,
        checkboxes: true,
        hideDisabledCheckboxes: false
    };

    protected readonly columnDefs = computed<ColDef[]>(() =>
        Array.from({ length: 20 }, (_, index) => ({
            headerName: this.t().headerText,
            field: 'column' + index
        }))
    );

    protected readonly rowData = computed<ExampleRowData[]>(() =>
        Array.from({ length: 100 }, (_, index) => {
            return this.columnDefs().reduce((prev, _cur, i) => {
                prev['column' + i] = `${this.t().headerText} ${index}`;

                return prev;
            }, {} as ExampleRowData);
        })
    );

    protected onFirstDataRendered({ api }: FirstDataRenderedEvent): void {
        api.forEachNode((node) => {
            if (node.rowIndex === 3 || node.rowIndex === 4) {
                node.setSelected(true);
            }
        });
    }
}

@Component({
    selector: 'example-content-panel',
    imports: [
        KbqButtonModule,
        KbqBadgeModule,
        KbqLink,
        KbqIconModule,
        KbqContentPanelModule,
        KbqModalModule,
        ExampleGrid
    ],
    template: `
        <kbq-modal-title class="example-modal-title">
            <div>{{ t().clickRowHint }}</div>
            <div class="example-modal-title-actions">
                <button kbq-button [color]="componentColors.Contrast" (click)="modalRef.close()">
                    {{ t().closeWindow }}
                </button>
                <button
                    kbq-button
                    [attr.aria-label]="t().more"
                    [color]="componentColors.Contrast"
                    [kbqStyle]="buttonStyles.Transparent"
                >
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
                                kbq-button
                                [attr.aria-label]="t().reportBug"
                                [class.kbq-active]="$first"
                                [color]="componentColors.Contrast"
                                [kbqStyle]="buttonStyles.Transparent"
                            >
                                <i kbq-icon="kbq-bug_16"></i>
                            </button>
                        }
                    </kbq-content-panel-aside>
                    <kbq-content-panel-header>
                        <div class="example-content-header-title" kbqContentPanelHeaderTitle>
                            <span>{{ t().selectedRow(selectedRowIndex()) }}</span>
                            <kbq-badge [badgeColor]="badgeColors.FadeError">8,6</kbq-badge>
                            <a kbqLink pseudo>July 21, 2025 2:29 PM</a>
                        </div>
                        <div class="example-content-header-actions" kbqContentPanelHeaderActions>
                            <button
                                kbq-button
                                [attr.aria-label]="t().copyLink"
                                [color]="componentColors.Contrast"
                                [kbqStyle]="buttonStyles.Transparent"
                            >
                                <i kbq-icon="kbq-link_16"></i>
                            </button>
                            <button
                                kbq-button
                                [attr.aria-label]="t().expand"
                                [color]="componentColors.Contrast"
                                [kbqStyle]="buttonStyles.Transparent"
                            >
                                <i kbq-icon="kbq-arrows-expand-diagonal_16"></i>
                            </button>
                            <button
                                kbq-button
                                [attr.aria-label]="t().more"
                                [color]="componentColors.Contrast"
                                [kbqStyle]="buttonStyles.Transparent"
                            >
                                <i kbq-icon="kbq-ellipsis-vertical_16"></i>
                            </button>
                        </div>
                        <div class="example-content-header-caption">{{ t().caption }}</div>
                        <div class="example-content-header-buttons">
                            <button kbq-button [color]="componentColors.ContrastFade">
                                <i kbq-icon="kbq-pencil_16"></i>
                                {{ t().edit }}
                            </button>
                            <button kbq-button [color]="componentColors.ContrastFade">
                                <i kbq-icon="kbq-square-multiple-o_16"></i>
                                {{ t().copy }}
                            </button>
                            <button kbq-button [color]="componentColors.ContrastFade">
                                <i kbq-icon="kbq-trash_16"></i>
                                {{ t().delete }}
                            </button>
                        </div>
                    </kbq-content-panel-header>
                    <kbq-content-panel-body class="example-content-panel-body">
                        @for (_i of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]; track $index) {
                            <p>{{ t().dosText($index) }}</p>
                        }
                    </kbq-content-panel-body>
                    <kbq-content-panel-footer>
                        <button kbq-button [color]="componentColors.Contrast">Button 1</button>
                        <button kbq-button [color]="componentColors.ContrastFade">Button 2</button>
                        <button kbq-button [color]="componentColors.ContrastFade">Button 3</button>
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
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleContentPanel {
    protected readonly t = injectTranslation(TRANSLATIONS);

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
 * @title Ag-grid and content-panel example
 */
@Component({
    selector: 'ag-grid-and-content-panel-example',
    imports: [KbqButtonModule, KbqModalModule],
    template: `
        <button kbq-button (click)="openModal()">{{ t().showExample }}</button>
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
export class AgGridAndContentPanelExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    private readonly modal = inject(KbqModalService);

    openModal(): void {
        this.modal.open({
            kbqComponent: ExampleContentPanel,
            kbqWidth: '90vw',
            kbqClosable: false
        });
    }
}
