import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { A, createKeyboardEvent, dispatchEvent } from '@koobiq/components/core';
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

/** Roots, in render order: rootNode_1, Pictures, Documents, Downloads, Applications — all collapsed. */
const DATA: Node[] = [
    { name: 'rootNode_1' },
    { name: 'Pictures', children: [{ name: 'Sun' }, { name: 'Woods' }] },
    { name: 'Documents', children: [{ name: 'react' }, { name: 'angular' }] },
    { name: 'Downloads', children: [{ name: 'Tutorial' }] },
    { name: 'Applications', children: [{ name: 'Chrome' }] }
];

const ROOTS = ['rootNode_1', 'Pictures', 'Documents', 'Downloads', 'Applications'];

@Component({
    imports: [KbqTreeModule, ReactiveFormsModule],
    template: `
        <kbq-tree-selection
            multiple="keyboard"
            [dataSource]="dataSource"
            [treeControl]="treeControl"
            [formControl]="control"
            (selectionChange)="onSelectionChange()"
            (selectAllChange)="onSelectAllChange()"
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
    readonly control = new FormControl<string[]>([]);
    readonly onSelectionChange = vi.fn();
    readonly onSelectAllChange = vi.fn();
    readonly tree = viewChild.required<KbqTreeSelection<FlatNode>>(KbqTreeSelection);

    constructor() {
        this.dataSource.data = DATA;
    }
}

describe('triage: tree "select all" that changes only collapsed nodes', () => {
    let fixture: ComponentFixture<TestApp>;
    let component: TestApp;
    let treeElement: HTMLElement;

    const settle = async () => {
        fixture.detectChanges();
        await vi.runOnlyPendingTimersAsync();
        fixture.detectChanges();
    };

    beforeEach(async () => {
        vi.useFakeTimers();
        TestBed.configureTestingModule({ imports: [KbqTreeModule, ReactiveFormsModule] });
        fixture = TestBed.createComponent(TestApp);
        component = fixture.componentInstance;
        treeElement = fixture.nativeElement.querySelector('kbq-tree-selection');
        await settle();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('DEFECT: Ctrl+A selects the collapsed nodes and changes the value, but emits no selectionChange', async () => {
        component.control.setValue(ROOTS);
        await settle();

        expect(treeElement.querySelectorAll('.kbq-tree-option').length).toBe(ROOTS.length);

        const selectAllKeyEvent = createKeyboardEvent('keydown', A);

        Object.defineProperty(selectAllKeyEvent, 'ctrlKey', { get: () => true });
        dispatchEvent(treeElement, selectAllKeyEvent);
        await settle();

        expect(component.control.value!.length).toBe(component.treeControl.dataNodes.length);
        expect(component.control.value!.length).toBeGreaterThan(ROOTS.length);
        expect(component.onSelectAllChange).toHaveBeenCalledTimes(1);
        expect(component.onSelectionChange).not.toHaveBeenCalled();
    });
});
