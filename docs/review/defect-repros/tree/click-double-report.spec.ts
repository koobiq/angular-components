import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { dispatchKeyboardEvent, DOWN_ARROW } from '@koobiq/components/core';
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

@Component({
    imports: [KbqTreeModule, ReactiveFormsModule],
    template: `
        <kbq-tree-selection
            [dataSource]="dataSource"
            [treeControl]="treeControl"
            [formControl]="control"
            (selectionChange)="onSelectionChange()"
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
    readonly onSelectionChange = vi.fn();
    readonly tree = viewChild.required<KbqTreeSelection<FlatNode>>(KbqTreeSelection);

    constructor() {
        this.dataSource.data = DATA;
    }
}

describe('triage: tree plain click and autoSelect key clear the model before selecting', () => {
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
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('DEFECT: a click on another node reports an empty value to the form before the new one', async () => {
        component.control.setValue('Pictures');
        await settle();

        const values: unknown[] = [];

        component.control.valueChanges.subscribe((value) => values.push(value));

        option('Documents').click();
        await settle();

        expect(values).toEqual([undefined, 'Documents']);
    });

    it('DEFECT: a click on the already selected node reports it twice, emits selectionChange and dirties the control', async () => {
        component.control.setValue('Pictures');
        await settle();

        const values: unknown[] = [];

        component.control.valueChanges.subscribe((value) => values.push(value));

        option('Pictures').click();
        await settle();

        expect(component.control.value).toBe('Pictures');
        expect(values).toEqual([undefined, 'Pictures']);
        expect(component.onSelectionChange).toHaveBeenCalledTimes(1);
        expect(component.control.dirty).toBe(true);
    });

    it('DEFECT: Down on the selected last row reports the unchanged value twice and dirties the control', async () => {
        component.control.setValue('Applications');
        await settle();

        const tree = component.tree();

        tree.keyManager.setActiveItem(4);

        const values: unknown[] = [];

        component.control.valueChanges.subscribe((value) => values.push(value));

        dispatchKeyboardEvent(treeElement, 'keydown', DOWN_ARROW);
        await settle();

        expect(tree.keyManager.activeItemIndex).toBe(4);
        expect(values).toEqual([undefined, 'Applications']);
        expect(component.onSelectionChange).toHaveBeenCalledTimes(1);
        expect(component.control.dirty).toBe(true);
    });
});
