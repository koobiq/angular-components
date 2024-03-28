import { of as observableOf } from 'rxjs';

import { NestedTreeControl } from './nested-tree-control';


/* tslint:disable:no-magic-numbers */
describe('CdkNestedTreeControl', () => {
    let treeControl: NestedTreeControl<TestData>;
    const getChildren = (node: TestData) => observableOf(node.children);

    beforeEach(() => {
        treeControl = new NestedTreeControl<TestData>(getChildren);
    });

    describe('base tree control actions', () => {
        it('should be able to expand and collapse dataNodes', () => {
            const nodes = generateData(10, 4);
            const node = nodes[1];
            const sixthNode = nodes[5];
            treeControl.dataNodes = nodes;

            treeControl.expand(node);


            expect(treeControl.isExpanded(node))
                .withContext('Expect second node to be expanded')
                .toBeTruthy();
            expect(treeControl.expansionModel.selected)
                .withContext('Expect second node in expansionModel')
                .toContain(node);
            expect(treeControl.expansionModel.selected.length)
                .withContext('Expect only second node in expansionModel')
                .toBe(1);

            treeControl.toggle(sixthNode);

            expect(treeControl.isExpanded(node))
                .withContext('Expect second node to stay expanded')
                .toBeTruthy();
            expect(treeControl.expansionModel.selected)
                .withContext('Expect sixth node in expansionModel')
                .toContain(sixthNode);
            expect(treeControl.expansionModel.selected)
                .withContext('Expect second node in expansionModel')
                .toContain(node);
            expect(treeControl.expansionModel.selected.length)
                .withContext('Expect two dataNodes in expansionModel')
                .toBe(2);

            treeControl.collapse(node);

            expect(treeControl.isExpanded(node))
                .withContext('Expect second node to be collapsed')
                .toBeFalsy();
            expect(treeControl.expansionModel.selected.length)
                .withContext('Expect one node in expansionModel')
                .toBe(1);
            expect(treeControl.isExpanded(sixthNode))
                .withContext('Expect sixth node to stay expanded')
                .toBeTruthy();
            expect(treeControl.expansionModel.selected)
                .withContext('Expect sixth node in expansionModel')
                .toContain(sixthNode);
        });

        it('should toggle descendants correctly', () => {
            const numNodes = 10;
            const numChildren = 4;
            const numGrandChildren = 2;
            const nodes = generateData(numNodes, numChildren, numGrandChildren);
            treeControl.dataNodes = nodes;

            treeControl.expandDescendants(nodes[1]);

            // tslint:disable-next-line
            const expandedNodesNum = 1 + numChildren + numChildren * numGrandChildren;
            expect(treeControl.expansionModel.selected.length)
                .withContext(`Expect expanded ${expandedNodesNum} nodes`)
                .toBe(expandedNodesNum);

            expect(treeControl.isExpanded(nodes[1]))
                .withContext('Expect second node to be expanded')
                .toBeTruthy();

            for (let i = 0; i < numChildren; i++) {
                expect(treeControl.isExpanded(nodes[1].children[i]))
                    .withContext(`Expect second node's children to be expanded`)
                    .toBeTruthy();

                for (let j = 0; j < numGrandChildren; j++) {
                    expect(treeControl.isExpanded(nodes[1].children[i].children[j]))
                        .withContext(`Expect second node grand children to be expanded`)
                        .toBeTruthy();
                }
            }
        });

        it('should be able to expand/collapse all the dataNodes', () => {
            const numNodes = 10;
            const numChildren = 4;
            const numGrandChildren = 2;
            const nodes = generateData(numNodes, numChildren, numGrandChildren);
            treeControl.dataNodes = nodes;

            treeControl.expandDescendants(nodes[1]);

            treeControl.collapseAll();

            expect(treeControl.expansionModel.selected.length)
                .withContext(`Expect no expanded nodes`)
                .toBe(0);

            treeControl.expandAll();

            const totalNumber = numNodes + numNodes * numChildren
                + numNodes * numChildren * numGrandChildren;
            expect(treeControl.expansionModel.selected.length)
                .withContext(`Expect ${totalNumber} expanded nodes`)
                .toBe(totalNumber);
        });
    });
});

export class TestData {
    a: string;
    b: string;
    c: string;
    level: number;
    children: TestData[];

    constructor(a: string, b: string, c: string, level: number = 1, children: TestData[] = []) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.level = level;
        this.children = children;
    }
}

function generateData(dataLength: number, childLength: number, grandChildLength: number = 0): TestData[] {
    const data = <any> [];
    let nextIndex = 0;

    for (let i = 0; i < dataLength; i++) {
        const children = <any> [];
        for (let j = 0; j < childLength; j++) {
            const grandChildren = <any> [];
            for (let k = 0; k < grandChildLength; k++) {
                grandChildren.push(new TestData(`a_${nextIndex}`, `b_${nextIndex}`, `c_${nextIndex++}`, 3));
            }
            children.push(
                new TestData(`a_${nextIndex}`, `b_${nextIndex}`, `c_${nextIndex++}`, 2, grandChildren));
        }
        data.push(new TestData(`a_${nextIndex}`, `b_${nextIndex}`, `c_${nextIndex++}`, 1, children));
    }

    return data;
}
