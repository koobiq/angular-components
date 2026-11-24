import {
    ChangeDetectionStrategy,
    Component,
    input,
    type OnChanges,
    output,
    type SimpleChanges,
    ViewEncapsulation
} from '@angular/core';

/**
 * Extra CSS classes that can be associated with a calendar cell.
 */
export type KbqCalendarCellCssClasses = string | string[] | Set<string> | { [key: string]: any };

/**
 * An internal class that represents the data corresponding to a single calendar cell.
 *
 * @docs-private
 */
export class KbqCalendarCell {
    constructor(
        public value: number,
        public displayValue: string,
        public enabled: boolean,
        public cssClasses?: KbqCalendarCellCssClasses
    ) {}
}

/**
 * An internal component used to display calendar data in a table.
 *
 * @docs-private
 */
@Component({
    selector: '[kbq-calendar-body]',
    imports: [],
    templateUrl: './calendar-body.html',
    styleUrl: './calendar-body.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-calendar__body'
    },
    exportAs: 'kbqCalendarBody'
})
export class KbqCalendarBody implements OnChanges {
    /** The cells to display in the table. */
    readonly rows = input<KbqCalendarCell[][]>(undefined!);

    /** The value in the table that corresponds to today. */
    readonly todayValue = input<number | null>(null);

    /** The value in the table that is currently selected. */
    // eslint-disable-next-line @angular-eslint/prefer-signal-model -- the view that owns the value sets it on a click
    readonly selectedValue = input<number | null>(null);

    /** The minimum number of free cells needed to fit the label in the first row. */
    readonly labelMinRequiredCells = input<number>(undefined!);

    /** The number of columns in the table. */
    readonly numCols = input(7);

    /** The cell number of the active cell in the table. */
    readonly activeCell = input(0);

    /**
     * The aspect ratio (width / height) to use for the cells in the table. This aspect ratio will be
     * maintained even as the table resizes.
     */
    readonly cellAspectRatio = input(1);

    /** Emits when a new value is selected. */
    readonly selectedValueChange = output<number>();

    /** The number of blank cells to put at the beginning for the first row. Defaults to `0`. */
    firstRowOffset = 0;

    /** Padding for the individual date cells. Defaults to `''`. */
    cellPadding = '';

    /** Width of an individual cell. Defaults to `''`. */
    cellWidth = '';

    cellClicked(cell: KbqCalendarCell): void {
        if (cell.enabled) {
            this.selectedValueChange.emit(cell.value);
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        const columnChanges = changes['numCols'];
        const { rows: rowsInput, numCols: numColsInput } = this;
        const rows = rowsInput();
        const numCols = numColsInput();

        if (changes['rows'] || columnChanges) {
            const firstRowLength = rows?.[0]?.length;

            this.firstRowOffset = firstRowLength ? numCols - firstRowLength : 0;
        }

        if (changes['cellAspectRatio'] || columnChanges || !this.cellPadding) {
            // todo
            // this.cellPadding = `${this.cellAspectRatio * 50 / numCols}%`;
            this.cellPadding = '0';
        }

        if (columnChanges || !this.cellWidth) {
            this.cellWidth = `${100 / numCols}%`;
        }
    }

    isActiveCell(rowIndex: number, colIndex: number): boolean {
        let cellNumber = rowIndex * this.numCols() + colIndex;

        // Account for the fact that the first row may not have as many cells.
        if (rowIndex) {
            cellNumber -= this.firstRowOffset;
        }

        return cellNumber === this.activeCell();
    }
}
