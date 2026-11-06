import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { Component, Injectable, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KbqTableModule } from '@koobiq/components/table';
import { Observable, Subject } from 'rxjs';

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

const mockClientHeight = (element: Element, height: number): void => {
    Object.defineProperty(element, 'getClientRects', {
        value: () => [{ height }],
        configurable: true
    });
};

describe('KbqTable triage: <thead> changed under a living sticky table', () => {
    it('DEFECT: a <thead> rendered into an already-rendered sticky table is never observed or measured', () => {
        const fixture = createComponent(TableHeadAddedLate);
        const observer = TestBed.inject(SharedResizeObserver) as MockResizeObserver;

        expect(getTable(fixture).tHead).toBeNull();
        expect(observer.observed).toHaveLength(0);

        fixture.componentInstance.showHead = true;
        fixture.detectChanges();

        const head = getTable(fixture).tHead!;

        expect(head).not.toBeNull();
        expect(getTable(fixture).classList).toContain('kbq-table_sticky-header');

        mockClientHeight(head, 42);
        observer.resize();
        fixture.detectChanges();

        // The new header is pinned but nothing observes it, so no height is ever published.
        expect(observer.observed).not.toContain(head);
        expect(observer.observed).toHaveLength(0);
        expect(getStickyHeaderHeight(fixture)).toBe('');
    });

    it('DEFECT: a replaced <thead> is not observed; the observer stays on the detached old header', () => {
        const fixture = createComponent(TableHeadSwapped);
        const observer = TestBed.inject(SharedResizeObserver) as MockResizeObserver;

        const oldHead = getTable(fixture).tHead!;

        expect(observer.observed).toEqual([oldHead]);

        mockClientHeight(oldHead, 42);
        observer.resize();
        fixture.detectChanges();

        expect(getStickyHeaderHeight(fixture)).toBe('42px');

        fixture.componentInstance.twoLineHead = true;
        fixture.detectChanges();

        const newHead = getTable(fixture).tHead!;

        expect(newHead).not.toBe(oldHead);
        expect(oldHead.isConnected).toBe(false);

        mockClientHeight(newHead, 64);
        observer.resize();
        fixture.detectChanges();

        expect(observer.observed).toEqual([oldHead]);
        expect(getStickyHeaderHeight(fixture)).not.toBe('64px');
    });
});

@Component({
    selector: 'table-head-added-late',
    imports: [KbqTableModule],
    template: `
        <table kbq-table stickyHeader>
            @if (showHead) {
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
class TableHeadAddedLate {
    showHead = false;
}

@Component({
    selector: 'table-head-swapped',
    imports: [KbqTableModule],
    template: `
        <table kbq-table stickyHeader>
            @if (twoLineHead) {
                <thead>
                    <tr>
                        <th scope="col">
                            Long
                            <br />
                            header
                        </th>
                    </tr>
                </thead>
            } @else {
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
class TableHeadSwapped {
    twoLineHead = false;
}
