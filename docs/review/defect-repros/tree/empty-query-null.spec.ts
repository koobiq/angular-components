import { FlatTreeControl, KbqTreeFlatDataSource, KbqTreeFlattener } from '@koobiq/components/tree';
import { BehaviorSubject } from 'rxjs';

interface Node {
    name: string;
    children?: Node[];
}

interface FlatNode {
    name: string;
    level: number;
    expandable: boolean;
}

const flush = () => new Promise<void>((resolve) => setTimeout(resolve));

function createTree(data: Node[]) {
    const control = new FlatTreeControl<FlatNode>(
        (node) => node.level,
        (node) => node.expandable,
        (node) => node.name,
        (node) => node.name
    );
    const flattener = new KbqTreeFlattener<Node, FlatNode>(
        (node, level) => ({ name: node.name, level, expandable: !!node.children }),
        (node) => node.level,
        (node) => node.expandable,
        (node) => node.children
    );
    const dataSource = new KbqTreeFlatDataSource(control, flattener);

    dataSource.data = data;

    const rendered: string[][] = [];
    const subscription = dataSource
        .connect({ viewChange: new BehaviorSubject({ start: 0, end: Number.MAX_VALUE }) })
        .subscribe((nodes) => rendered.push(nodes.map(({ name }) => name)));

    return { control, rendered, subscription };
}

describe('triage: tree empty filter query reaches the matcher as null', () => {
    it('DEFECT: clearing the query keeps the tree filtered down to the nodes whose label contains "null"', async () => {
        const { control, rendered, subscription } = createTree([
            { name: 'Types', children: [{ name: 'Nullable' }, { name: 'String' }] },
            { name: 'Documents' }
        ]);

        control.filterNodes('doc');
        await flush();

        expect(rendered.at(-1)).toEqual(['Documents']);

        control.filterNodes('');
        await flush();

        // The cleared query leaves a non-empty filter value behind, so the data source keeps filtering.
        expect(Array.isArray(control.filterValue.value)).toBe(true);
        expect((control.filterValue.value as FlatNode[]).map(({ name }) => name)).toEqual(['Types', 'Nullable']);
        expect(rendered.at(-1)).toEqual(['Types', 'Nullable']);

        // And expansion stays locked, as it does while a filter is active.
        const types = control.dataNodes.find(({ name }) => name === 'Types')!;

        control.collapse(types);
        expect(control.isExpanded(types)).toBe(true);

        subscription.unsubscribe();
    });

    it('DEFECT: the default matcher turns a null query into /null/gi', () => {
        const { control, subscription } = createTree([{ name: 'Nullable' }, { name: 'Documents' }]);

        expect(control.compareViewValues('Nullable', null)).toBe(true);
        expect(control.compareViewValues('Documents', null)).toBe(false);

        subscription.unsubscribe();
    });

    it('contrast: without such a label the cleared query shows the whole tree again', async () => {
        const { control, rendered, subscription } = createTree([
            { name: 'Types', children: [{ name: 'Optional' }, { name: 'String' }] },
            { name: 'Documents' }
        ]);

        control.filterNodes('doc');
        await flush();

        control.filterNodes('');
        await flush();

        expect(rendered.at(-1)).toEqual(['Types', 'Documents']);

        subscription.unsubscribe();
    });
});
