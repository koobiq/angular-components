import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { dispatchKeyboardEvent, SPACE } from '@koobiq/components/core';
import {
    FlatTreeControl,
    KbqTreeFlatDataSource,
    KbqTreeFlattener,
    KbqTreeModule,
    KbqTreeSelection
} from '@koobiq/components/tree';

interface Node {
    name: string;
    children?: Node[];
}

interface FlatNode {
    name: string;
    level: number;
    expandable: boolean;
}

/** Roots, in render order: rootNode_1, Pictures, Documents, Downloads, Applications. */
const DATA: Node[] = [
    { name: 'rootNode_1' },
    { name: 'Pictures', children: [{ name: 'Sun' }, { name: 'Woods' }] },
    { name: 'Documents', children: [{ name: 'react' }, { name: 'angular' }] },
    { name: 'Downloads', children: [{ name: 'Tutorial' }] },
    { name: 'Applications', children: [{ name: 'Chrome' }] }
];

// Single selection with autoSelect off, as in the tree-action-button, tree-selection-separate-from-focus and
// tree-toggle-on-click examples.
@Component({
    imports: [KbqTreeModule, ReactiveFormsModule],
    template: `
        <kbq-tree-selection
            [autoSelect]="false"
            [dataSource]="dataSource"
            [treeControl]="treeControl"
            [formControl]="control"
        >
            <kbq-tree-option *kbqTreeNodeDef="let node">{{ node.name }}</kbq-tree-option>
        </kbq-tree-selection>
    `
})
class TestApp {
    readonly treeControl = new FlatTreeControl<FlatNode>(
        (node) => node.level,
        (node) => node.expandable,
        (node) => node.name,
        (node) => node.name
    );
    readonly treeFlattener = new KbqTreeFlattener<Node, FlatNode>(
        (node, level) => ({ name: node.name, level, expandable: !!node.children }),
        (node) => node.level,
        (node) => node.expandable,
        (node) => node.children
    );
    readonly dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);
    readonly control = new FormControl<string | null>(null);
    readonly tree = viewChild.required<KbqTreeSelection<FlatNode>>(KbqTreeSelection);

    constructor() {
        this.dataSource.data = DATA;
    }
}

describe('triage: tree plain click with autoSelect off skips the noUnselectLast guard', () => {
    let fixture: ComponentFixture<TestApp>;
    let component: TestApp;
    let treeElement: HTMLElement;

    const settle = async () => {
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();
        fixture.detectChanges();
    };

    const option = (name: string): HTMLElement =>
        Array.from<HTMLElement>(treeElement.querySelectorAll('.kbq-tree-option')).find(
            (node) => node.textContent!.trim() === name
        )!;

    beforeEach(async () => {
        vi.useFakeTimers();
        TestBed.configureTestingModule({ imports: [KbqTreeModule, ReactiveFormsModule] });
        fixture = TestBed.createComponent(TestApp);
        component = fixture.componentInstance;
        treeElement = fixture.nativeElement.querySelector('kbq-tree-selection');
        await settle();

        component.control.setValue('Pictures');
        await settle();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('DEFECT: a plain click deselects the only selected node although noUnselectLast is on', async () => {
        const tree = component.tree();

        expect(tree.autoSelect).toBe(false);
        expect(tree.noUnselectLast).toBe(true);

        option('Pictures').click();
        await settle();

        expect(tree.selectionModel.selected).toEqual([]);
        expect(component.control.value).toBeUndefined();
    });

    it('contrast: Space on the same node keeps it selected, the guard the click path skips', async () => {
        const tree = component.tree();

        tree.keyManager.setActiveItem(1);
        dispatchKeyboardEvent(treeElement, 'keydown', SPACE);
        await settle();

        expect(tree.getSelectedValues()).toBe('Pictures');
        expect(component.control.value).toBe('Pictures');
    });
});
