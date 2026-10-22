import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
    KBQ_SKELETON_PRESETS_CONFIGURATION,
    KbqSkeletonDl,
    KbqSkeletonGroup,
    KbqSkeletonTable
} from '@koobiq/components/skeleton';

@Component({
    selector: 'test-partial-token',
    imports: [KbqSkeletonDl, KbqSkeletonTable, KbqSkeletonGroup],
    template: `
        <kbq-skeleton-dl />
        <kbq-skeleton-table />
        <kbq-skeleton-group preset="badge" />
    `
})
class TestApp {}

const count = (root: HTMLElement, selector: string): number => root.querySelectorAll(selector).length;

describe('KBQ_SKELETON_PRESETS_CONFIGURATION provided directly (triage)', () => {
    it('DEFECT: a partial value provided directly leaves the missing counts undefined, so presets render one item', () => {
        // `useValue` is typed `any`, so no cast is needed for this to compile.
        TestBed.configureTestingModule({
            providers: [{ provide: KBQ_SKELETON_PRESETS_CONFIGURATION, useValue: { tableRows: 4 } }]
        });

        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();

        const root: HTMLElement = fixture.nativeElement;

        // Defaults are dlRows 3, tableColumns 3 and groupCount 3.
        expect(count(root, 'kbq-skeleton-dl > .kbq-skeleton-dl__term')).toBe(1);
        expect(count(root, '.kbq-skeleton-table__cell_header')).toBe(1);
        expect(count(root, '.kbq-skeleton-table__cell:not(.kbq-skeleton-table__cell_header)')).toBe(4);
        expect(count(root, 'kbq-skeleton-group > .kbq-skeleton')).toBe(1);
    });
});
