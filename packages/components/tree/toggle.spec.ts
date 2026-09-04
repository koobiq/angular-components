import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FlatTreeControl } from './control/flat-tree-control';
import { KbqTreeFlatDataSource, KbqTreeFlattener } from './data-source/flat-data-source';
import { KbqTreeNodeToggleComponent } from './toggle';
import { KbqTreeSelection } from './tree-selection.component';
import { KbqTreeModule } from './tree.module';

interface Node {
    name: string;
    children?: Node[];
}

interface FlatNode {
    name: string;
    level: number;
    expandable: boolean;
}

/**
 * src
 *   cdk
 *     a11y
 *   README
 * tests
 */
const DATA: Node[] = [
    { name: 'src', children: [{ name: 'cdk', children: [{ name: 'a11y' }] }, { name: 'README' }] },
    { name: 'tests' }
];

@Component({
    imports: [KbqTreeModule],
    template: `
        <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                <kbq-tree-node-toggle
                    [node]="node"
                    [disabled]="disabledToggles.includes(node.name)"
                    [kbqTreeNodeToggleRecursive]="recursive"
                />

                {{ node.name }}
            </kbq-tree-option>
        </kbq-tree-selection>
    `
})
class TreeWithToggle {
    treeControl = new FlatTreeControl<FlatNode>(
        (node) => node.level,
        (node) => node.expandable,
        (node) => node.name,
        (node) => node.name
    );

    treeFlattener = new KbqTreeFlattener<Node, FlatNode>(
        (node, level) => ({ name: node.name, level, expandable: !!node.children?.length }),
        (node) => node.level,
        (node) => node.expandable,
        (node) => node.children
    );

    dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

    recursive = false;
    disabledToggles: string[] = [];

    @ViewChild(KbqTreeSelection, { static: false }) tree: KbqTreeSelection;

    constructor() {
        this.dataSource.data = DATA;
    }
}

describe('KbqTreeNodeToggle', () => {
    let fixture: ComponentFixture<TreeWithToggle>;
    let component: TreeWithToggle;

    const rows = (): HTMLElement[] =>
        Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.kbq-tree-option'));

    const labels = (): string[] => rows().map((row) => row.querySelector('.kbq-option-text')!.textContent!.trim());

    const clickToggleOf = (name: string) => {
        const row = rows().find((item) => item.querySelector('.kbq-option-text')!.textContent!.trim() === name)!;

        (row.querySelector('kbq-tree-node-toggle') as HTMLElement).click();
        fixture.detectChanges();
    };

    const toggleOf = (name: string): KbqTreeNodeToggleComponent<FlatNode> =>
        fixture.debugElement
            .queryAll(By.directive(KbqTreeNodeToggleComponent))
            .find(
                (debugElement) =>
                    debugElement.nativeElement.parentElement.querySelector('.kbq-option-text').textContent.trim() ===
                    name
            )!.componentInstance;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [KbqTreeModule] }).compileComponents();

        fixture = TestBed.createComponent(TreeWithToggle);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should expand the node it belongs to', () => {
        expect(labels()).toEqual(['src', 'tests']);

        clickToggleOf('src');

        expect(labels()).toEqual(['src', 'cdk', 'README', 'tests']);
    });

    it('should collapse the node again', () => {
        clickToggleOf('src');
        clickToggleOf('src');

        expect(labels()).toEqual(['src', 'tests']);
    });

    it('should not select the row it sits in', () => {
        clickToggleOf('src');

        expect(component.tree.selectionModel.selected.length).toBe(0);
    });

    it('should expand the whole subtree when recursive', () => {
        component.recursive = true;
        fixture.detectChanges();

        clickToggleOf('src');

        expect(labels()).toEqual(['src', 'cdk', 'a11y', 'README', 'tests']);
    });

    it('should reflect the expanded state on the host', () => {
        expect(rows()[0].querySelector('kbq-tree-node-toggle')!.classList).not.toContain('kbq-expanded');

        clickToggleOf('src');

        expect(rows()[0].querySelector('kbq-tree-node-toggle')!.classList).toContain('kbq-expanded');
    });

    it('should do nothing while it is disabled', () => {
        component.disabledToggles = ['src'];
        fixture.detectChanges();

        clickToggleOf('src');

        expect(labels()).toEqual(['src', 'tests']);
    });

    it('should mark itself disabled once a filter is active', fakeAsync(() => {
        expect(toggleOf('src').disabled).toBe(false);

        component.treeControl.filterNodes('a11y');
        tick();
        fixture.detectChanges();

        expect(toggleOf('src').disabled).toBe(true);

        flush();
    }));

    it('should combine the disabled input with the filter state', fakeAsync(() => {
        component.disabledToggles = ['src'];
        fixture.detectChanges();

        expect(toggleOf('src').disabled).toBe(true);

        component.treeControl.filterNodes('a11y');
        tick();
        fixture.detectChanges();

        expect(toggleOf('src').disabled).toBe(true);

        flush();
    }));

    it('should stop listening to the filter stream once the tree is gone', () => {
        const filterValue = component.treeControl.filterValue as unknown as { observers: unknown[] };

        expect(filterValue.observers.length).toBeGreaterThan(0);

        fixture.destroy();

        expect(filterValue.observers.length).toBe(0);
    });
});
