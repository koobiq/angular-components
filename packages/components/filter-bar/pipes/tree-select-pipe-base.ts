import { AfterViewInit, Directive, effect, OnInit, Signal, untracked, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import {
    FilterByViewValue,
    FilterParentsForNodes,
    FlatTreeControl,
    KbqTreeFlatDataSource,
    KbqTreeFlattener
} from '@koobiq/components/tree';
import { KbqTreeSelect } from '@koobiq/components/tree-select';
import { kbqResolveFilterBarName } from '../filter-bar-name';
import { KbqSelectValue, KbqTreeSelectFlatNode, KbqTreeSelectNode } from '../filter-bar.types';
import { KbqBasePipe } from './base-pipe';

/**
 * Shared scaffolding for the tree-based select pipes (`kbq-pipe-tree-select`,
 * `kbq-pipe-multi-tree-select`): the flat-tree control / flattener / data source, the node accessors,
 * search-driven filtering and open handling. Subclasses provide the value-specific pieces (`selected`,
 * `isEmpty`, `onSelect`, `updateTemplates`).
 *
 * The `internalTemplatesChanges` subscription is intentionally left in each subclass constructor: it must
 * be set up after the subclass's `updateTemplates` field initializer runs, so the initial `BehaviorSubject`
 * replay dispatches to the subclass override (which writes `dataSource.data`) rather than the base one.
 */
@Directive()
export abstract class KbqTreeSelectPipeBase<V> extends KbqBasePipe<V> implements OnInit, AfterViewInit {
    /** control for search options */
    readonly searchControl = new FormControl<string | null>(null);

    treeControl: FlatTreeControl<KbqTreeSelectFlatNode>;
    treeFlattener: KbqTreeFlattener<KbqTreeSelectNode, KbqTreeSelectFlatNode>;
    dataSource: KbqTreeFlatDataSource<KbqTreeSelectNode, KbqTreeSelectFlatNode>;

    private readonly sourceNodes = new WeakMap<KbqTreeSelectFlatNode, KbqTreeSelectNode>();

    /**
     * Flat nodes of the current data, re-emitted whenever `dataSource.data` is replaced. Read by the
     * name-tracking effect so it follows nodes supplied after initialization.
     */
    private readonly flatNodes: Signal<KbqTreeSelectFlatNode[]>;

    /** @docs-private */
    readonly select = viewChild.required<KbqTreeSelect<KbqTreeSelectFlatNode>>(KbqTreeSelect);

    constructor() {
        super();

        this.treeFlattener = new KbqTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);

        this.treeControl = new FlatTreeControl<KbqTreeSelectFlatNode>(
            this.getLevel,
            this.isExpandable,
            this.getValue,
            this.getViewValue
        );

        const filterByViewValue = new FilterByViewValue<KbqTreeSelectFlatNode>(
            this.treeControl,
            // A `valueTemplate` replaces the caption, so a captioned node is matched by its name only.
            (node, query) =>
                !this.isTemplateRef(this.valueTemplate) &&
                !!node.caption &&
                this.treeControl.compareViewValues(node.caption, query)
        );

        this.treeControl.setFilters(filterByViewValue, new FilterParentsForNodes(this.treeControl));

        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        // Seeds `treeControl.dataNodes`, which `expandAll()` and the search filter read: a template without
        // `values` never assigns the data, and the panel still opens onto the "no options" message.
        this.dataSource.data = [];

        this.flatNodes = toSignal(this.dataSource.flattenedData, { initialValue: [] });

        // The search matches view values, which follow the node-name signals. Reading every name here makes
        // this effect their consumer, so a translation re-applies the current query rather than leaving the
        // panel filtered by the previous labels. `flatNodes` re-emits on every data assignment, so nodes
        // supplied after initialization are tracked too.
        effect(() => {
            this.flatNodes().forEach((node) => kbqResolveFilterBarName(node.name));

            untracked(() => this.reapplySearch());
        });
    }

    ngOnInit(): void {
        this.searchControl.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((value) => this.treeControl.applyFilter(value));
    }

    override ngAfterViewInit() {
        super.ngAfterViewInit();

        this.select()
            .closedStream.pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.filterBar?.onClosePipe.emit(this.data));
    }

    /** tree-node predicate: whether the node has children */
    hasChild(_: number, nodeData: KbqTreeSelectFlatNode) {
        return nodeData.expandable;
    }

    /** opens the tree-select panel */
    override open() {
        setTimeout(() => {
            if (this.destroyed) return;

            // Without options the search is hidden and nothing in the panel takes the focus: the trigger has
            // to, or Escape never reaches the select.
            if (this.noOptions) this.focusTrigger();

            this.select().open();
        });
    }

    /** @docs-private */
    onOpen() {
        if (this.data.defaultExpanded === false) {
            this.treeControl.collapseAll();
            this.expandSelectedNodeAncestors();
        } else {
            this.treeControl.expandAll();
        }
    }

    /**
     * Values of the currently selected nodes, in the shape `treeControl.compareValues` understands.
     * Read from the pipe's own state rather than the select's selection model: the select applies a
     * value written ahead of its data only once the options render, which is after `onOpen` fires.
     *
     * @docs-private
     */
    protected abstract getSelectedValues(): KbqSelectValue[];

    /**
     * Expands the ancestors of every selected node. Selected values are matched against the current
     * `dataNodes` by `compareValues`, not by flat-node reference: re-assigning `dataSource.data` rebuilds
     * the flat nodes, so a stale node reference would miss.
     */
    private expandSelectedNodeAncestors(): void {
        const selectedValues = this.getSelectedValues();
        const selectedNodes = this.treeControl.dataNodes.filter((node) =>
            selectedValues.some((value) => this.treeControl.compareValues(node.value, value))
        );

        for (const node of selectedNodes) {
            let current = node.parent;

            while (current) {
                this.treeControl.expand(current);
                current = current.parent;
            }
        }
    }

    /** @docs-private */
    protected getSourceNode(node: KbqTreeSelectFlatNode): KbqTreeSelectNode {
        return this.sourceNodes.get(node)!;
    }

    protected transformer = (node: KbqTreeSelectNode, level: number, parent: KbqTreeSelectFlatNode | null) => {
        const flatNode = new KbqTreeSelectFlatNode();

        flatNode.name = node.name;
        flatNode.value = node.value;
        flatNode.caption = node.caption;
        flatNode.parent = parent ?? undefined;
        flatNode.level = level;
        flatNode.expandable = !!node.children;

        this.sourceNodes.set(flatNode, node);

        return flatNode;
    };

    protected getLevel = (node: KbqTreeSelectFlatNode) => node.level;

    protected isExpandable = (node: KbqTreeSelectFlatNode) => node.expandable;

    protected getChildren = (node: KbqTreeSelectNode): KbqTreeSelectNode[] | null => node.children;

    protected getValue = (node: KbqTreeSelectFlatNode): unknown => node.value;

    protected getViewValue = (node: KbqTreeSelectFlatNode): string => kbqResolveFilterBarName(node.name);

    /** Re-applies the active search: the view values it matches follow the node-name signals. */
    private reapplySearch(): void {
        const query = this.treeControl.filterQuery;

        if (query) this.treeControl.applyFilter(query);
    }
}
