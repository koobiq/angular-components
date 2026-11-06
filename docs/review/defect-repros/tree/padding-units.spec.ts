import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FlatTreeControl, KbqTreeFlatDataSource, KbqTreeFlattener, KbqTreeModule } from '@koobiq/components/tree';

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
 * root
 *   child
 *     grandchild
 */
const DATA: Node[] = [{ name: 'root', children: [{ name: 'child', children: [{ name: 'grandchild' }] }] }];

abstract class TreeParams {
    readonly treeControl = new FlatTreeControl<FlatNode>(
        (node) => node.level,
        (node) => node.expandable,
        (node) => node.name,
        (node) => node.name
    );
    readonly treeFlattener = new KbqTreeFlattener<Node, FlatNode>(
        (node, level) => ({ name: node.name, level, expandable: !!node.children?.length }),
        (node) => node.level,
        (node) => node.expandable,
        (node) => node.children
    );
    readonly dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);
    readonly indent = '10em';

    constructor() {
        this.dataSource.data = DATA;
    }
}

@Component({
    imports: [KbqTreeModule],
    template: `
        <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding [kbqTreeNodePaddingIndent]="indent">
                <kbq-tree-node-toggle />
                {{ node.name }}
            </kbq-tree-option>
        </kbq-tree-selection>
    `
})
class TreeWithToggle extends TreeParams {}

@Component({
    imports: [KbqTreeModule],
    template: `
        <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding [kbqTreeNodePaddingIndent]="indent">
                {{ node.name }}
            </kbq-tree-option>
        </kbq-tree-selection>
    `
})
class TreeWithoutToggle extends TreeParams {}

describe('triage: tree padding corrections are pixel amounts applied in the indent units', () => {
    const paddings = (fixture: ComponentFixture<unknown>): string[] =>
        Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.kbq-tree-option')).map(
            (node) => node.style.paddingLeft
        );

    const render = <T extends TreeParams>(type: new (...args: any[]) => T): ComponentFixture<T> => {
        const fixture = TestBed.createComponent(type);

        fixture.detectChanges();
        fixture.componentInstance.treeControl.expandAll();
        fixture.detectChanges();

        return fixture;
    };

    beforeEach(() => TestBed.configureTestingModule({ imports: [KbqTreeModule] }));

    it('DEFECT: with a 10em indent a root row with a toggle gets 8em (the 2px border taken as 2em)', () => {
        expect(paddings(render(TreeWithToggle))).toEqual(['8em', '20em', '30em']);
    });

    it('DEFECT: with a 10em indent a root row without a toggle gets 32em (the 24px toggle room taken as 24em)', () => {
        expect(paddings(render(TreeWithoutToggle))).toEqual(['32em', '44em', '54em']);
    });
});
