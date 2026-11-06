import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqSkeletonTable } from '@koobiq/components/skeleton';

@Component({
    selector: 'test-null-columns',
    imports: [KbqSkeletonTable],
    template: `
        <kbq-skeleton-table [columns]="columns()" />
    `
})
class TestApp {
    // What `columns$ | async` yields before its first value in a template without strict type checking.
    readonly columns = signal(null as unknown as readonly string[]);
}

@Component({
    selector: 'test-undefined-columns',
    imports: [KbqSkeletonTable],
    template: `
        <kbq-skeleton-table [columns]="columns()" />
    `
})
class TestUndefinedApp {
    readonly columns = signal(undefined as unknown as readonly string[]);
}

describe('KbqSkeletonTable columns (triage)', () => {
    it('DEFECT: [columns]="null" throws a TypeError while computing grid-template-columns', () => {
        const fixture = TestBed.createComponent(TestApp);

        expect(() => fixture.detectChanges()).toThrow(
            /this.columns is not a function or its return value is not iterable/
        );
    });

    it('control: [columns]="undefined" renders a single column without throwing', () => {
        const fixture = TestBed.createComponent(TestUndefinedApp);

        fixture.detectChanges();

        expect(fixture.nativeElement.querySelectorAll('.kbq-skeleton-table__cell_header').length).toBe(1);
    });
});
