import type { SelectionModel } from '@angular/cdk/collections';
import type { BehaviorSubject, Observable } from 'rxjs';

/** Options of `FlatTreeControl` and `NestedTreeControl`. */
export interface KbqTreeControlOptions<T, K> {
    /** Initial value of the control's `trackBy`. */
    trackBy?: (dataNode: T) => K;
}

/**
 * Tree control interface. User can implement TreeControl to expand/collapse dataNodes in the tree.
 * The Tree will use this TreeControl to expand/collapse a node.
 * User can also use it outside the `<kbq-tree>` to control the expansion status of the tree.
 */
export interface TreeControl<T, K = T> {
    /** The saved tree nodes data for `expandAll` action. */
    dataNodes: T[];

    /** The expansion model: the keys of the expanded data nodes, which are the nodes themselves by default. */
    expansionModel: SelectionModel<K>;

    filterModel: SelectionModel<T>;

    /** The query of the active filter, or `null` when no filter is active. */
    readonly filterQuery: string | null;

    /** Whether a filter is active: the filter model holds at least one node, or a query is set. */
    readonly hasActiveFilter: boolean;

    /** Gives the key a data node is expanded by. Without it the node object is its own key. */
    trackBy?: (dataNode: T) => K;

    /**
     * Stream with the filter query or result. Published for backward compatibility.
     *
     * @deprecated Use `filterQuery` for the query string and `filterModel` for the filter state. Will be removed in 22.0.0.
     */
    filterValue: BehaviorSubject<T[] | string | null>;

    /** Get depth of a given data node, return the level number. Only a control of a flat tree has it. */
    getLevel: ((dataNode: T) => number) | undefined;

    /**
     * Whether the data node is expandable. Returns true if expandable.
     * Only a control of a flat tree has it.
     */
    isExpandable: ((dataNode: T) => boolean) | undefined;

    /**
     * Gets a stream that emits whenever the given data node's children change.
     * Only a control of a nested tree has it.
     */
    getChildren: ((dataNode: T) => Observable<T[]>) | undefined;

    /** Whether the data node is expanded or collapsed. Return true if it's expanded. */
    isExpanded(dataNode: T): boolean;

    /** Get all descendants of a data node */
    getDescendants(dataNode: T): any[];

    /** Expand or collapse data node */
    toggle(dataNode: T): void;

    /** Expand one data node */
    expand(dataNode: T): void;

    /** Collapse one data node */
    collapse(dataNode: T): void;

    /** Expand all the dataNodes in the tree */
    expandAll(): void;

    /** Collapse all the dataNodes in the tree */
    collapseAll(): void;

    /** Toggle a data node by expand/collapse it and all its descendants */
    toggleDescendants(dataNode: T): void;

    /** Expand a data node and all its descendants */
    expandDescendants(dataNode: T): void;

    /** Collapse a data node and all its descendants */
    collapseDescendants(dataNode: T): void;
}
