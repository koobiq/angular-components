import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { Component, Injectable, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KbqButtonModule } from '@koobiq/components/button';
import { axe } from 'jest-axe';
import { Observable, Subject } from 'rxjs';
import { KbqTableModule } from './table.module';

@Injectable()
class MockResizeObserver extends SharedResizeObserver {
    readonly observed: Element[] = [];

    private readonly changes = new Subject<ResizeObserverEntry[]>();

    override observe(target: Element, _options?: ResizeObserverOptions): Observable<ResizeObserverEntry[]> {
        this.observed.push(target);

        return this.changes.asObservable();
    }

    resize(): void {
        this.changes.next([]);
    }
}

const createComponent = <T>(component: Type<T>): ComponentFixture<T> => {
    TestBed.configureTestingModule({
        imports: [component],
        providers: [{ provide: SharedResizeObserver, useClass: MockResizeObserver }]
    });

    const fixture = TestBed.createComponent(component);

    fixture.detectChanges();

    return fixture;
};

const getTable = (fixture: ComponentFixture<unknown>): HTMLTableElement =>
    fixture.nativeElement.querySelector('table[kbq-table]');

const getStickyHeaderHeight = (fixture: ComponentFixture<unknown>): string =>
    getTable(fixture).style.getPropertyValue('--kbq-table-size-sticky-header-height');

// `KbqTable` reads the height through `kbqGetElementHeight`, which goes through `getClientRects()`
// rather than `offsetHeight` — jsdom lays out neither, so both need stubbing in tests.
const mockClientHeight = (element: Element, height: number): void => {
    Object.defineProperty(element, 'getClientRects', {
        value: () => [{ height }],
        configurable: true
    });
};

describe('KbqTable', () => {
    describe('modifier classes', () => {
        it('should carry the base class only by default', () => {
            const fixture = createComponent(TableBindings);

            expect(getTable(fixture).className).toBe('kbq-table');
        });

        it('should toggle every modifier from a property binding', () => {
            const fixture = createComponent(TableBindings);

            fixture.componentInstance.border = true;
            fixture.componentInstance.disableHover = true;
            fixture.componentInstance.stickyHeader = true;
            fixture.detectChanges();

            const { classList } = getTable(fixture);

            expect(classList).toContain('kbq-table_bordered');
            expect(classList).toContain('kbq-table_disable-hover');
            expect(classList).toContain('kbq-table_sticky-header');
        });

        it('should drop a modifier when its binding goes back to false', () => {
            const fixture = createComponent(TableBindings);

            fixture.componentInstance.disableHover = true;
            fixture.detectChanges();
            fixture.componentInstance.disableHover = false;
            fixture.detectChanges();

            expect(getTable(fixture).classList).not.toContain('kbq-table_disable-hover');
        });

        // The guides document the bare-attribute form, which reaches the input as an empty string and
        // only becomes `true` through the `booleanAttribute` transform.
        it('should coerce the bare-attribute form of every modifier', () => {
            const fixture = createComponent(TableBareAttributes);

            const { classList } = getTable(fixture);

            expect(classList).toContain('kbq-table_bordered');
            expect(classList).toContain('kbq-table_disable-hover');
            expect(classList).toContain('kbq-table_sticky-header');
        });
    });

    describe('cell content', () => {
        // `KbqTableCellContent` was declared `selector: 'kbq-table td'`. Angular's selector grammar has
        // no descendant combinator, so the second tag overwrote the first and the effective selector was
        // `td` — every cell in every template importing the module got a directive instance, a content
        // query and, with a button inside, the modifier class. The padding is plain CSS now.
        it('should not attach anything to cells, inside or outside a kbq-table', () => {
            const fixture = createComponent(TableCellsWithButtons);

            const styledCell: HTMLElement = fixture.nativeElement.querySelector('[data-testid="styled-cell"]');
            const plainCell: HTMLElement = fixture.nativeElement.querySelector('[data-testid="plain-cell"]');

            expect(styledCell.querySelector('.kbq-button')).not.toBeNull();
            expect(plainCell.querySelector('.kbq-button')).not.toBeNull();

            expect(fixture.nativeElement.querySelectorAll('.kbq-table-cell_has-button')).toHaveLength(0);
            expect(styledCell.className).toBe('');
            expect(plainCell.className).toBe('');
        });

        it('should leave a table without the kbq-table attribute completely unstyled', () => {
            const fixture = createComponent(TableCellsWithButtons);

            const plainTable: HTMLElement = fixture.nativeElement.querySelector('[data-testid="plain-table"]');

            expect(plainTable.className).toBe('');
        });
    });

    describe('sticky header', () => {
        it('should publish the measured header height', () => {
            const fixture = createComponent(TableBindings);
            const observer = TestBed.inject(SharedResizeObserver) as MockResizeObserver;

            fixture.componentInstance.stickyHeader = true;
            fixture.detectChanges();

            const head = getTable(fixture).tHead!;

            expect(observer.observed).toContain(head);

            mockClientHeight(head, 42);
            observer.resize();
            fixture.detectChanges();

            expect(getStickyHeaderHeight(fixture)).toBe('42px');
        });

        it('should neither observe nor publish anything while the header is not pinned', () => {
            const fixture = createComponent(TableBindings);
            const observer = TestBed.inject(SharedResizeObserver) as MockResizeObserver;

            expect(observer.observed).toHaveLength(0);
            expect(getStickyHeaderHeight(fixture)).toBe('');
        });

        it('should stop publishing the height when the header is unpinned', () => {
            const fixture = createComponent(TableBindings);
            const observer = TestBed.inject(SharedResizeObserver) as MockResizeObserver;

            fixture.componentInstance.stickyHeader = true;
            fixture.detectChanges();

            const head = getTable(fixture).tHead!;

            mockClientHeight(head, 42);
            observer.resize();
            fixture.detectChanges();

            fixture.componentInstance.stickyHeader = false;
            fixture.detectChanges();

            expect(getStickyHeaderHeight(fixture)).toBe('');

            // The subscription is gone, so a later resize cannot resurrect the value.
            observer.resize();
            fixture.detectChanges();

            expect(getStickyHeaderHeight(fixture)).toBe('');
        });

        // The effect's only tracked input is `stickyHeader()`; `tHead` itself is a plain DOM read. A
        // `MutationObserver` on the table's own child list is what notices a `<thead>` mounting later
        // (behind `@if`, async columns, `@defer`...) and makes the effect re-read it.
        it('should observe a thead that mounts after the table has already rendered', async () => {
            const fixture = createComponent(TableDeferredHeader);
            const observer = TestBed.inject(SharedResizeObserver) as MockResizeObserver;

            expect(observer.observed).toHaveLength(0);

            fixture.componentInstance.showHeader = true;
            fixture.detectChanges();

            // MutationObserver callbacks land in a microtask queued after this turn.
            await new Promise((resolve) => setTimeout(resolve));
            fixture.detectChanges();

            const head = getTable(fixture).tHead!;

            expect(head).not.toBeNull();
            expect(observer.observed).toContain(head);

            mockClientHeight(head, 24);
            observer.resize();
            fixture.detectChanges();

            expect(getStickyHeaderHeight(fixture)).toBe('24px');
        });
    });

    it('should have no axe violations', async () => {
        const fixture = createComponent(TableCellsWithButtons);

        document.body.appendChild(fixture.nativeElement);

        try {
            expect(await axe(fixture.nativeElement)).toHaveNoViolations();
        } finally {
            document.body.removeChild(fixture.nativeElement);
        }
    });
});

@Component({
    selector: 'table-bindings',
    imports: [KbqTableModule],
    template: `
        <table kbq-table [border]="border" [disableHover]="disableHover" [stickyHeader]="stickyHeader">
            <thead>
                <tr>
                    <th scope="col">Header</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th scope="row">Row header</th>
                    <td>Cell</td>
                </tr>
            </tbody>
        </table>
    `
})
class TableBindings {
    border = false;
    disableHover = false;
    stickyHeader = false;
}

@Component({
    selector: 'table-deferred-header',
    imports: [KbqTableModule],
    template: `
        <table kbq-table stickyHeader>
            @if (showHeader) {
                <thead>
                    <tr>
                        <th scope="col">Header</th>
                    </tr>
                </thead>
            }
            <tbody>
                <tr>
                    <td>Cell</td>
                </tr>
            </tbody>
        </table>
    `
})
class TableDeferredHeader {
    showHeader = false;
}

@Component({
    selector: 'table-bare-attributes',
    imports: [KbqTableModule],
    template: `
        <table kbq-table border disableHover stickyHeader>
            <thead>
                <tr>
                    <th scope="col">Header</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Cell</td>
                </tr>
            </tbody>
        </table>
    `
})
class TableBareAttributes {}

@Component({
    selector: 'table-cells-with-buttons',
    imports: [KbqTableModule, KbqButtonModule],
    template: `
        <table kbq-table>
            <tbody>
                <tr>
                    <td data-testid="styled-cell">
                        <button kbq-button>Open</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <table data-testid="plain-table">
            <tbody>
                <tr>
                    <td data-testid="plain-cell">
                        <button kbq-button>Open</button>
                    </td>
                </tr>
            </tbody>
        </table>
    `
})
class TableCellsWithButtons {}
