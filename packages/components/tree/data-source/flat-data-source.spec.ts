import { CollectionViewer } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { FlatTreeControl } from '../control/flat-tree-control';
import { KbqTreeFlatDataSource, KbqTreeFlattener } from './flat-data-source';

interface Node {
    name: string;
    children?: Node[];
}

interface FlatNode {
    name: string;
    level: number;
    expandable: boolean;
    parent: FlatNode | null;
}

/**
 * root
 *   documents
 *     draft
 *   images
 * other
 */
const buildData = (): Node[] => [
    {
        name: 'root',
        children: [{ name: 'documents', children: [{ name: 'draft' }] }, { name: 'images' }]
    },
    { name: 'other' }
];

const transformer = (node: Node, level: number, parent: FlatNode | null): FlatNode => ({
    name: node.name,
    level,
    expandable: !!node.children?.length,
    parent
});

const getLevel = (node: FlatNode) => node.level;
const isExpandable = (node: FlatNode) => node.expandable;
const getValue = (node: FlatNode) => node.name;

const names = (nodes: FlatNode[]): string[] => nodes.map((node) => node.name);

const byName = (nodes: FlatNode[], name: string): FlatNode => nodes.find((node) => node.name === name)!;

describe('KbqTreeFlattener', () => {
    const createFlattener = (getChildren: (node: Node) => Observable<Node[]> | Node[] | undefined) =>
        new KbqTreeFlattener<Node, FlatNode>(transformer, getLevel, isExpandable, getChildren);

    it('should flatten a nested structure depth first', () => {
        const flattener = createFlattener((node) => node.children);

        expect(names(flattener.flattenNodes(buildData()))).toEqual([
            'root',
            'documents',
            'draft',
            'images',
            'other'
        ]);
    });

    it('should assign a level per nesting depth, starting at zero', () => {
        const flattener = createFlattener((node) => node.children);
        const flat = flattener.flattenNodes(buildData());

        expect(flat.map((node) => node.level)).toEqual([0, 1, 2, 1, 0]);
    });

    it('should hand every node its flattened parent', () => {
        const flattener = createFlattener((node) => node.children);
        const flat = flattener.flattenNodes(buildData());

        expect(byName(flat, 'root').parent).toBeNull();
        expect(byName(flat, 'documents').parent).toBe(byName(flat, 'root'));
        expect(byName(flat, 'draft').parent).toBe(byName(flat, 'documents'));
    });

    it('should accept children delivered as an observable', () => {
        const flattener = createFlattener((node) => of(node.children ?? []));

        expect(names(flattener.flattenNodes(buildData()))).toEqual([
            'root',
            'documents',
            'draft',
            'images',
            'other'
        ]);
    });

    describe('expandFlattenedNodes', () => {
        let flattener: KbqTreeFlattener<Node, FlatNode>;
        let control: FlatTreeControl<FlatNode>;
        let flat: FlatNode[];

        beforeEach(() => {
            flattener = createFlattener((node) => node.children);
            control = new FlatTreeControl<FlatNode>(getLevel, isExpandable, getValue, getValue);
            flat = flattener.flattenNodes(buildData());
            control.dataNodes = flat;
        });

        it('should keep only the root level while nothing is expanded', () => {
            expect(names(flattener.expandFlattenedNodes(flat, control))).toEqual(['root', 'other']);
        });

        it('should reveal the children of an expanded node', () => {
            control.expand(byName(flat, 'root'));

            expect(names(flattener.expandFlattenedNodes(flat, control))).toEqual([
                'root',
                'documents',
                'images',
                'other'
            ]);
        });

        it('should keep a grandchild hidden while its own parent is collapsed', () => {
            control.expand(byName(flat, 'documents'));

            expect(names(flattener.expandFlattenedNodes(flat, control))).toEqual(['root', 'other']);
        });
    });
});

describe('KbqTreeFlatDataSource', () => {
    let control: FlatTreeControl<FlatNode>;
    let flattener: KbqTreeFlattener<Node, FlatNode>;
    let dataSource: KbqTreeFlatDataSource<Node, FlatNode>;
    let collectionViewer: CollectionViewer;

    beforeEach(() => {
        control = new FlatTreeControl<FlatNode>(getLevel, isExpandable, getValue, getValue);
        flattener = new KbqTreeFlattener<Node, FlatNode>(transformer, getLevel, isExpandable, (node) => node.children);
        dataSource = new KbqTreeFlatDataSource(control, flattener);
        collectionViewer = { viewChange: new BehaviorSubject({ start: 0, end: Number.MAX_VALUE }) };
    });

    it('should flatten the data it is given and hand it to the tree control', () => {
        dataSource.data = buildData();

        expect(names(dataSource.flattenedData.value)).toEqual(['root', 'documents', 'draft', 'images', 'other']);
        expect(control.dataNodes).toBe(dataSource.flattenedData.value);
    });

    it('should report the data it was last given', () => {
        const data = buildData();

        dataSource.data = data;

        expect(dataSource.data).toBe(data);
    });

    it('should emit the expanded nodes on connect', () => {
        const emissions: string[][] = [];

        dataSource.data = buildData();
        dataSource.connect(collectionViewer).subscribe((nodes) => emissions.push(names(nodes)));

        expect(emissions[emissions.length - 1]).toEqual(['root', 'other']);
    });

    it('should re-emit when a node is expanded', () => {
        const emissions: string[][] = [];

        dataSource.data = buildData();
        dataSource.connect(collectionViewer).subscribe((nodes) => emissions.push(names(nodes)));

        control.expand(byName(control.dataNodes, 'root'));

        expect(emissions[emissions.length - 1]).toEqual(['root', 'documents', 'images', 'other']);
    });

    it('should emit the filter result while a filter is active', async () => {
        const emissions: string[][] = [];

        dataSource.data = buildData();
        dataSource.connect(collectionViewer).subscribe((nodes) => emissions.push(names(nodes)));

        control.filterNodes('draft');
        await Promise.resolve();

        expect(emissions[emissions.length - 1]).toEqual(['root', 'documents', 'draft']);
    });

    it('should go back to the expansion state once the filter is dropped', async () => {
        const emissions: string[][] = [];

        dataSource.data = buildData();
        dataSource.connect(collectionViewer).subscribe((nodes) => emissions.push(names(nodes)));

        control.filterNodes('draft');
        await Promise.resolve();

        control.filterNodes('');
        await Promise.resolve();

        expect(emissions[emissions.length - 1]).toEqual(['root', 'other']);
    });
});
