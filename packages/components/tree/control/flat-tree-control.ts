import { escapeRegExp } from '@koobiq/components/core';
import { BaseTreeControl } from './base-tree-control';
import { FilterByViewValue, FilterParentsForNodes, FlatTreeControlFilter } from './flat-tree-control.filters';

export function defaultCompareValues(firstValue: string, secondValue: string): boolean {
    return firstValue === secondValue;
}

export function defaultCompareViewValues(firstViewValue: string, secondViewValue: string): boolean {
    return RegExp(escapeRegExp(secondViewValue), 'gi').test(firstViewValue);
}

/** Flat tree control. Able to expand/collapse a subtree recursively for flattened tree. */
export class FlatTreeControl<T> extends BaseTreeControl<T> {
    expandedItemsBeforeFiltration: T[];

    private filters: FlatTreeControlFilter<T>[];

    /** Construct with flat tree data node functions getLevel, isExpandable, getValue and getViewValue. */
    constructor(
        public getLevel: (dataNode: T) => number,
        public isExpandable: (dataNode: T) => boolean,
        /** getValue will be used to determine if the tree contains value or not. Used in method hasValue */
        public getValue: (dataNode: T) => any,
        /** getViewValue will be used for filter nodes. Returned value will be first argument in filterNodesFunction */
        public getViewValue: (dataNode: T) => string,
        /** compareValues will be used to comparing values. */
        public compareValues: (firstValue, secondValue) => boolean = defaultCompareValues,
        /** compareValues will be used to comparing values. */
        public compareViewValues: (firstViewValue, secondViewValue) => boolean = defaultCompareViewValues,
        /** isDisabled will be used to determine if the node is disabled. */
        public isDisabled: (dataNode: T) => boolean = () => false
    ) {
        super();

        this.setFilters(new FilterByViewValue<T>(this), new FilterParentsForNodes<T>(this));
    }

    getFilters(): FlatTreeControlFilter<T>[] {
        return this.filters;
    }

    setFilters(...filters: FlatTreeControlFilter<T>[]) {
        this.filters = filters;
    }

    /**
     * Gets a list of the data node's subtree of descendent data nodes.
     *
     * To make this working, the `dataNodes` of the TreeControl must be flattened tree nodes
     * with correct levels.
     */
    getDescendants(dataNode: T): T[] {
        const startIndex = this.dataNodes.indexOf(dataNode);
        const results: T[] = [];

        // Goes through flattened tree nodes in the `dataNodes` array, and get all descendants.
        // The level of descendants of a tree node must be greater than the level of the given
        // tree node.
        // If we reach a node whose level is equal to the level of the tree node, we hit a sibling.
        // If we reach a node whose level is greater than the level of the tree node, we hit a
        // sibling of an ancestor.
        for (
            let i = startIndex + 1;
            i < this.dataNodes.length && this.getLevel(dataNode) < this.getLevel(this.dataNodes[i]);
            i++
        ) {
            results.push(this.dataNodes[i]);
        }

        return results;
    }

    /**
     * Expands all data nodes in the tree.
     *
     * To make this working, the `dataNodes` variable of the TreeControl must be set to all flattened
     * data nodes of the tree.
     */
    expandAll(): void {
        this.expansionModel.select(...this.dataNodes);
    }

    /**
     * Ancestors of a data node, outermost first.
     *
     * Derived from `dataNodes` rather than from a `parent` back-reference: the flattened nodes are in
     * depth-first order, so scanning backwards from the node, the first node of a smaller level is its
     * parent, and repeating with that level yields the whole chain. A data node whose shape carries no
     * `parent` therefore resolves just as well as one that does.
     *
     * @param result Collector the ancestors are prepended to. Provided so callers can accumulate into
     * an existing array; a fresh one is used when omitted.
     */
    getParents(node: T, result: T[] = []): T[] {
        const startIndex = this.dataNodes?.indexOf(node) ?? -1;

        if (startIndex === -1) {
            return result;
        }

        let level = this.getLevel(node);

        for (let i = startIndex - 1; i >= 0 && level > 0; i--) {
            const candidate = this.dataNodes[i];
            const candidateLevel = this.getLevel(candidate);

            if (candidateLevel < level) {
                result.unshift(candidate);

                level = candidateLevel;
            }
        }

        return result;
    }

    hasValue(value: string): T | undefined {
        return this.dataNodes?.find((node: any) => this.compareValues(this.getValue(node), value));
    }

    filterNodes(value: string | null = null): void {
        this.saveExpansionState();

        let result: T[] = [];

        this.filters.forEach((filter, index, filters) => {
            const prevFilter = filters[index - 1] || null;

            result = filter.handle(value, prevFilter);
        });

        this.filterModel.clear();
        this.filterModel.select(...result);

        // set current expansion state according to filtered tree
        this.expansionModel.setSelection(...result.filter((node) => this.isExpandable(node)));

        this.updateFilterValue(value || result);

        Promise.resolve().then(() => this.restoreExpansionState());
    }

    private updateFilterValue(value: T[] | string | null) {
        Promise.resolve().then(() => this.filterValue.next(value));
    }

    private saveExpansionState() {
        if (!this.filterValue.value?.length) {
            this.expandedItemsBeforeFiltration = this.expansionModel.selected;
        }
    }

    private restoreExpansionState() {
        if (!this.filterValue.value?.length) {
            this.expansionModel.setSelection(...this.expandedItemsBeforeFiltration);
        }
    }
}
