/** Shared by the two tree-select cleaner examples, so neither repeats the tree plumbing. */

export class Node {
    name: string;
    children: Node[];
}

/** Flat node with expandable and level information. */
export class FlatNode {
    name: string;
    level: number;
    expandable: boolean;
    parent: FlatNode | null;
}

/** A shallow service tree: every node the examples disable sits at the top level, where it is rendered. */
export const TREE_DATA = {
    Servers: {
        'web-01': null,
        'web-02': null
    },
    Database: null,
    'Load balancer': null,
    'Message queue': null
};

export const buildTree = (value: object): Node[] =>
    Object.entries(value).map(([name, children]) => {
        const node = new Node();

        node.name = name;

        if (children) {
            node.children = buildTree(children);
        }

        return node;
    });

export const getLevel = (node: FlatNode): number => node.level;

export const isExpandable = (node: FlatNode): boolean => node.expandable;

export const getChildren = (node: Node): Node[] => node.children;

export const getValue = (node: FlatNode): string => node.name;

export const transformer = (node: Node, level: number, parent: FlatNode | null): FlatNode => {
    const flatNode = new FlatNode();

    flatNode.name = node.name;
    flatNode.level = level;
    flatNode.parent = parent;
    flatNode.expandable = !!node.children;

    return flatNode;
};
