import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { dispatchFakeEvent, dispatchKeyboardEvent, DOWN_ARROW } from '@koobiq/components/core';
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
            multiple="keyboard"
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
    readonly control = new FormControl<string[]>([]);
    readonly tree = viewChild.required<KbqTreeSelection<FlatNode>>(KbqTreeSelection);

    constructor() {
        this.dataSource.data = DATA;
    }
}

describe('triage: tree Shift click anchors on the option active before the last keyboard move', () => {
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

    it('DEFECT: after Down from Pictures to Documents, Shift + click on Applications spans from Pictures and selects nothing', async () => {
        const tree = component.tree();

        option('Pictures').click();
        await settle();

        expect(component.control.value).toEqual(['Pictures']);

        dispatchKeyboardEvent(treeElement, 'keydown', DOWN_ARROW);
        await settle();

        expect(component.control.value).toEqual(['Documents']);
        expect(tree.keyManager.activeItemIndex).toBe(2);
        // The anchor a Shift range starts from is the row that was left, not the one now active.
        expect(tree.keyManager.previousActiveItemIndex).toBe(1);

        // A pointer press focuses the row before the click lands.
        const target = option('Applications');

        dispatchFakeEvent(target, 'focusin');
        target.dispatchEvent(new MouseEvent('click', { shiftKey: true }));
        await settle();

        // Anchored on Documents (selected) the range would be Documents, Downloads, Applications. Anchored on
        // the deselected Pictures, every row is skipped by the noUnselectLast guard.
        expect(component.control.value).toEqual(['Documents']);
        expect(tree.selectionModel.selected.map(({ name }) => name)).toEqual(['Documents']);
    });
});
