import { FlatTreeControl } from './flat-tree-control';

describe('FlatTreeControl', () => {
    let treeControl: FlatTreeControl<TestData>;
    const getLevel = (node: TestData) => node.level;
    const isExpandable = (node: TestData) => node.children && node.children.length > 0;
    const getValue = (node: TestData) => node.name;

    beforeEach(() => {
        treeControl = new FlatTreeControl<TestData>(getLevel, isExpandable, getValue, getValue);
    });

    describe('base tree control actions', () => {
        it('should be able to expand and collapse dataNodes', () => {
            const nodes = generateData(10, 4);
            const secondNode = nodes[1];
            const sixthNode = nodes[5];

            treeControl.dataNodes = nodes;

            treeControl.expand(secondNode);

            expect(treeControl.isExpanded(secondNode)).toBeTruthy();
            expect(treeControl.expansionModel.selected).toContain(secondNode);
            expect(treeControl.expansionModel.selected.length).toBe(1);

            treeControl.toggle(sixthNode);

            expect(treeControl.isExpanded(secondNode)).toBeTruthy();
            expect(treeControl.isExpanded(sixthNode)).toBeTruthy();
            expect(treeControl.expansionModel.selected).toContain(sixthNode);
            expect(treeControl.expansionModel.selected).toContain(secondNode);
            expect(treeControl.expansionModel.selected.length).toBe(2);

            treeControl.collapse(secondNode);

            expect(treeControl.isExpanded(secondNode)).toBeFalsy();
            expect(treeControl.expansionModel.selected.length).toBe(1);
            expect(treeControl.isExpanded(sixthNode)).toBeTruthy();
            expect(treeControl.expansionModel.selected).toContain(sixthNode);
        });

        it('should return correct expandable values', () => {
            const nodes = generateData(10, 4);

            treeControl.dataNodes = nodes;

            for (let i = 0; i < 10; i++) {
                expect(treeControl.isExpandable(nodes[i])).toBeTruthy();

                for (let j = 0; j < 4; j++) {
                    expect(treeControl.isExpandable(nodes[i].children[j])).toBeFalsy();
                }
            }
        });

        it('should return correct levels', () => {
            const numNodes = 10;
            const numChildren = 4;
            const numGrandChildren = 2;
            const nodes = generateData(numNodes, numChildren, numGrandChildren);

            treeControl.dataNodes = nodes;

            for (let i = 0; i < numNodes; i++) {
                expect(treeControl.getLevel(nodes[i])).toBe(1);

                for (let j = 0; j < numChildren; j++) {
                    expect(treeControl.getLevel(nodes[i].children[j])).toBe(2);

                    for (let k = 0; k < numGrandChildren; k++) {
                        expect(treeControl.getLevel(nodes[i].children[j].children[k])).toBe(3);
                    }
                }
            }
        });

        it('should toggle descendants correctly', () => {
            const numNodes = 10;
            const numChildren = 4;
            const numGrandChildren = 2;
            const nodes = generateData(numNodes, numChildren, numGrandChildren);

            const data = [];

            flatten(nodes, data);
            treeControl.dataNodes = data;

            treeControl.expandDescendants(nodes[1]);

            const expandedNodesNum = numChildren + 1 + numChildren * numGrandChildren;

            expect(treeControl.expansionModel.selected.length).toBe(expandedNodesNum);

            expect(treeControl.isExpanded(nodes[1])).toBeTruthy();

            for (let i = 0; i < numChildren; i++) {
                expect(treeControl.isExpanded(nodes[1].children[i])).toBeTruthy();

                for (let j = 0; j < numGrandChildren; j++) {
                    expect(treeControl.isExpanded(nodes[1].children[i].children[j])).toBeTruthy();
                }
            }
        });

        it('should be able to expand/collapse all the dataNodes', () => {
            const numNodes = 10;
            const numChildren = 4;
            const numGrandChildren = 2;
            const nodes = generateData(numNodes, numChildren, numGrandChildren);
            const data = [];

            flatten(nodes, data);
            treeControl.dataNodes = data;

            treeControl.expandDescendants(nodes[1]);

            treeControl.collapseAll();

            expect(treeControl.expansionModel.selected.length).toBe(0);

            treeControl.expandAll();

            const totalNumber = numNodes + numNodes * numChildren + numNodes * numChildren * numGrandChildren;

            expect(treeControl.expansionModel.selected.length).toBe(totalNumber);
        });
    });

    describe('lookups over flattened data', () => {
        let control: FlatTreeControl<FlatNode>;
        let nodes: FlatNode[];

        beforeEach(() => {
            nodes = buildFlatNodes();
            control = new FlatTreeControl<FlatNode>(
                (node) => node.level,
                (node) => node.expandable,
                (node) => node.name,
                (node) => node.name
            );
            control.dataNodes = nodes;
        });

        describe('getDescendants', () => {
            it('should return the whole subtree of a branch', () => {
                expect(control.getDescendants(byName(nodes, 'documents')).map((node) => node.name)).toEqual([
                    'specs',
                    'draft',
                    'readme'
                ]);
            });

            it('should return nothing for a leaf', () => {
                expect(control.getDescendants(byName(nodes, 'readme'))).toEqual([]);
            });
        });

        describe('getParents', () => {
            it('should return the ancestors outermost first', () => {
                expect(control.getParents(byName(nodes, 'draft')).map((node) => node.name)).toEqual([
                    'root',
                    'documents',
                    'specs'
                ]);
            });

            it('should return nothing for a root node', () => {
                expect(control.getParents(byName(nodes, 'root'))).toEqual([]);
            });

            it('should resolve nodes that carry no parent back-reference', () => {
                const draft = byName(nodes, 'draft');

                expect(draft.parent).toBeUndefined();
                expect(control.getParents(draft).map((node) => node.name)).toEqual(['root', 'documents', 'specs']);
            });

            it('should prepend to the collector it is given', () => {
                const collector = [byName(nodes, 'other')];

                expect(control.getParents(byName(nodes, 'images'), collector).map((node) => node.name)).toEqual([
                    'root',
                    'other'
                ]);
            });

            it('should return the collector unchanged for a node outside the data', () => {
                const stranger: FlatNode = { name: 'stranger', level: 2, expandable: false };

                expect(control.getParents(stranger)).toEqual([]);
            });
        });

        describe('hasValue', () => {
            it('should find the node carrying the value', () => {
                expect(control.hasValue('specs')).toBe(byName(nodes, 'specs'));
            });

            it('should return undefined for an unknown value', () => {
                expect(control.hasValue('nothing')).toBeUndefined();
            });
        });

        describe('filterNodes', () => {
            it('should keep the matches together with their ancestors', () => {
                control.filterNodes('draft');

                expect(control.filterModel.selected.map((node) => node.name)).toEqual([
                    'root',
                    'documents',
                    'specs',
                    'draft'
                ]);
            });

            it('should expand every expandable node it kept', () => {
                control.filterNodes('draft');

                expect(control.expansionModel.selected.map((node) => node.name)).toEqual([
                    'root',
                    'documents',
                    'specs'
                ]);
            });

            it('should publish the query on filterValue', async () => {
                control.filterNodes('draft');

                await Promise.resolve();

                expect(control.filterValue.value).toBe('draft');
            });

            it('should remember the expansion state the filter replaced', () => {
                control.expand(byName(nodes, 'images'));

                control.filterNodes('draft');

                expect(control.expandedItemsBeforeFiltration.map((node) => node.name)).toEqual(['images']);
            });

            it('should restore the remembered expansion state once the query is dropped', async () => {
                control.expand(byName(nodes, 'images'));

                control.filterNodes('draft');
                await Promise.resolve();

                control.filterNodes('');
                await Promise.resolve();

                expect(control.expansionModel.selected.map((node) => node.name)).toEqual(['images']);
            });
        });
    });
});

/** Flat node in the depth-first order the flattener produces, with 0-based levels. */
interface FlatNode {
    name: string;
    level: number;
    expandable: boolean;
    parent?: FlatNode;
}

/**
 * root
 *   documents
 *     specs
 *       draft
 *     readme
 *   images
 * other
 */
function buildFlatNodes(): FlatNode[] {
    return [
        { name: 'root', level: 0, expandable: true },
        { name: 'documents', level: 1, expandable: true },
        { name: 'specs', level: 2, expandable: true },
        { name: 'draft', level: 3, expandable: false },
        { name: 'readme', level: 2, expandable: false },
        { name: 'images', level: 1, expandable: false },
        { name: 'other', level: 0, expandable: false }
    ];
}

function byName(nodes: FlatNode[], name: string): FlatNode {
    return nodes.find((node) => node.name === name)!;
}

export class TestData {
    a: string;
    b: string;
    c: string;
    level: number;
    name: string;
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
    const data = <any>[];
    let nextIndex = 0;

    for (let i = 0; i < dataLength; i++) {
        const children = <any>[];

        for (let j = 0; j < childLength; j++) {
            const grandChildren = <any>[];

            for (let k = 0; k < grandChildLength; k++) {
                grandChildren.push(new TestData(`a_${nextIndex}`, `b_${nextIndex}`, `c_${nextIndex++}`, 3));
            }

            children.push(new TestData(`a_${nextIndex}`, `b_${nextIndex}`, `c_${nextIndex++}`, 2, grandChildren));
        }

        data.push(new TestData(`a_${nextIndex}`, `b_${nextIndex}`, `c_${nextIndex++}`, 1, children));
    }

    return data;
}

function flatten(nodes: TestData[], data: TestData[]) {
    for (const node of nodes) {
        data.push(node);

        if (node.children && node.children.length > 0) {
            flatten(node.children, data);
        }
    }
}
