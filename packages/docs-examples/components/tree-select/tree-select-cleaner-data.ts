/** Keeps the tree plumbing out of the cleaner example, which is about the reset control. */

export class Node {
    id: string;
    label: string;
    children: Node[];
}

/** Flat node with expandable and level information. */
export class FlatNode {
    id: string;
    label: string;
    level: number;
    expandable: boolean;
    parent: FlatNode | null;
}

export interface TreeNames {
    servers: string;
    database: string;
    loadBalancer: string;
    messageQueue: string;
}

const node = (id: string, label: string, children: Node[] = []): Node => {
    const result = new Node();

    result.id = id;
    result.label = label;
    result.children = children;

    return result;
};

/** Tree of the example; `id` is the stable value the selection works with, `label` follows the locale. */
export const getTreeData = (names: TreeNames): Node[] => [
    node('servers', names.servers, [node('web-01', 'web-01'), node('web-02', 'web-02')]),
    node('database', names.database),
    node('loadBalancer', names.loadBalancer),
    node('messageQueue', names.messageQueue)
];

export const getLevel = (node: FlatNode): number => node.level;

export const isExpandable = (node: FlatNode): boolean => node.expandable;

export const getChildren = (node: Node): Node[] => node.children;

export const getValue = (node: FlatNode): string => node.id;

export const getLabel = (node: FlatNode): string => node.label;

export const transformer = (node: Node, level: number, parent: FlatNode | null): FlatNode => {
    const flatNode = new FlatNode();

    flatNode.id = node.id;
    flatNode.label = node.label;
    flatNode.level = level;
    flatNode.parent = parent;
    flatNode.expandable = node.children.length > 0;

    return flatNode;
};
