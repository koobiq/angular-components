import { FlatTreeControl } from './flat-tree-control';
import {
    FilterByValues,
    FilterByViewValue,
    FilterParentsForNodes,
    kbqTreeSelectAllValue
} from './flat-tree-control.filters';

/**
 * root
 *   documents
 *     draft
 *   images
 * other
 */
interface Node {
    name: string;
    level: number;
    expandable: boolean;
    value?: string;
}

describe('FlatTreeControl filters', () => {
    let control: FlatTreeControl<Node>;
    let nodes: Node[];

    const names = (result: Node[]): string[] => result.map((node) => node.name);

    beforeEach(() => {
        nodes = [
            { name: 'root', level: 0, expandable: true },
            { name: 'documents', level: 1, expandable: true },
            { name: 'draft', level: 2, expandable: false },
            { name: 'images', level: 1, expandable: false },
            { name: 'other', level: 0, expandable: false }
        ];

        control = new FlatTreeControl<Node>(
            (node) => node.level,
            (node) => node.expandable,
            (node) => node.name,
            (node) => node.name
        );
        control.dataNodes = nodes;
    });

    describe('FilterByViewValue', () => {
        it('should keep the nodes whose view value contains the query', () => {
            expect(names(new FilterByViewValue(control).handle('o'))).toEqual(['root', 'documents', 'other']);
        });

        it('should be case insensitive', () => {
            expect(names(new FilterByViewValue(control).handle('DRAFT'))).toEqual(['draft']);
        });

        it('should always keep the select-all row', () => {
            nodes.unshift({ name: 'select all', level: 0, expandable: false, value: kbqTreeSelectAllValue });

            expect(names(new FilterByViewValue(control).handle('draft'))).toEqual(['select all', 'draft']);
        });

        it('should drop the select-all row when it is the only thing left', () => {
            nodes.unshift({ name: 'select all', level: 0, expandable: false, value: kbqTreeSelectAllValue });

            expect(new FilterByViewValue(control).handle('nothing matches this')).toEqual([]);
        });

        it('should expose the last result on `result`', () => {
            const filter = new FilterByViewValue(control);

            filter.handle('draft');

            expect(names(filter.result)).toEqual(['draft']);
        });
    });

    describe('FilterParentsForNodes', () => {
        it('should re-add the ancestors of every match, in tree order', () => {
            const previous = new FilterByViewValue(control);

            previous.handle('draft');

            expect(names(new FilterParentsForNodes(control).handle(null, previous))).toEqual([
                'root',
                'documents',
                'draft'
            ]);
        });

        it('should not repeat an ancestor shared by two matches', () => {
            const previous = new FilterByViewValue(control);

            previous.handle('a');

            expect(names(new FilterParentsForNodes(control).handle(null, previous))).toEqual([
                'root',
                'documents',
                'draft',
                'images'
            ]);
        });

        it('should return nothing when the previous stage is missing', () => {
            expect(new FilterParentsForNodes(control).handle(null, null as never)).toEqual([]);
        });
    });

    describe('FilterByValues', () => {
        it('should add the nodes carrying the configured values', () => {
            const filter = new FilterByValues(control);

            filter.setValues(['images']);

            expect(names(filter.handle(null))).toEqual(['images']);
        });

        it('should keep what the previous stage matched', () => {
            const previous = new FilterByViewValue(control);
            const filter = new FilterByValues(control);

            previous.handle('draft');
            filter.setValues(['images']);

            expect(names(filter.handle(null, previous))).toEqual(['draft', 'images']);
        });

        it('should not repeat a node the previous stage already matched', () => {
            const previous = new FilterByViewValue(control);
            const filter = new FilterByValues(control);

            previous.handle('draft');
            filter.setValues(['draft']);

            expect(names(filter.handle(null, previous))).toEqual(['draft']);
        });

        it('should report the values it was given', () => {
            const filter = new FilterByValues(control);

            filter.setValues(['draft', 'images']);

            expect(filter.getValues()).toEqual(['draft', 'images']);
        });
    });
});
