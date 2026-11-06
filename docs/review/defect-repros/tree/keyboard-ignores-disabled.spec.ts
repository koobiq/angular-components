import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { dispatchKeyboardEvent, DOWN_ARROW, SPACE } from '@koobiq/components/core';
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
    imports: [KbqTreeModule],
    template: `
        <kbq-tree-selection
            [disabled]="disabled"
            [dataSource]="dataSource"
            [treeControl]="treeControl"
            (selectionChange)="onSelectionChange()"
        >
            <kbq-tree-option *kbqTreeNodeDef="let node">{{ node.name }}</kbq-tree-option>
        </kbq-tree-selection>
    `
})
class TestApp {
    disabled = false;
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
    readonly onSelectionChange = vi.fn();
    readonly tree = viewChild.required<KbqTreeSelection<FlatNode>>(KbqTreeSelection);

    constructor() {
        this.dataSource.data = DATA;
    }
}

describe('triage: tree keyboard handling ignores the disabled state', () => {
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
        TestBed.configureTestingModule({ imports: [KbqTreeModule] });
        fixture = TestBed.createComponent(TestApp);
        component = fixture.componentInstance;
        treeElement = fixture.nativeElement.querySelector('kbq-tree-selection');
        await settle();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('DEFECT: Space on the active option of a tree disabled while focus is inside selects it', async () => {
        const tree = component.tree();

        tree.keyManager.setActiveItem(1);

        component.disabled = true;
        await settle();

        expect(tree.disabled).toBe(true);
        expect(tree.keyManager.activeItem!.disabled).toBe(true);

        dispatchKeyboardEvent(treeElement, 'keydown', SPACE);
        await settle();

        expect(tree.getSelectedValues()).toBe('Pictures');
        expect(component.onSelectionChange).toHaveBeenCalledTimes(1);
    });

    it('DEFECT: Down on a disabled tree moves the selection onto the active option', async () => {
        const tree = component.tree();

        option('Documents').click();
        await settle();

        expect(tree.getSelectedValues()).toBe('Documents');

        tree.keyManager.setActiveItem(1);

        component.disabled = true;
        await settle();

        component.onSelectionChange.mockClear();

        dispatchKeyboardEvent(treeElement, 'keydown', DOWN_ARROW);
        await settle();

        // Every option is disabled, so the key manager cannot move; the active one is re-selected anyway.
        expect(tree.keyManager.activeItemIndex).toBe(1);
        expect(tree.getSelectedValues()).toBe('Pictures');
        expect(component.onSelectionChange).toHaveBeenCalledTimes(1);
    });
});
