import { AfterViewInit, Directive, OnInit, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { FlatTreeControl, KbqTreeFlatDataSource, KbqTreeFlattener } from '@koobiq/components/tree';
import { KbqTreeSelect } from '@koobiq/components/tree-select';
import { KbqTreeSelectFlatNode, KbqTreeSelectNode } from '../filter-bar.types';
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

    /** @docs-private */
    readonly select = viewChild.required(KbqTreeSelect);

    constructor() {
        super();

        this.treeFlattener = new KbqTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);

        this.treeControl = new FlatTreeControl<KbqTreeSelectFlatNode>(
            this.getLevel,
            this.isExpandable,
            this.getValue,
            this.getViewValue
        );

        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);
    }

    ngOnInit(): void {
        this.searchControl.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((value) => this.treeControl.filterNodes(value));
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
        setTimeout(() => this.select().open());
    }

    /** @docs-private */
    onOpen() {
        this.treeControl.expandAll();
    }

    protected transformer = (node: KbqTreeSelectNode, level: number, parent: KbqTreeSelectFlatNode | null) => {
        const flatNode = new KbqTreeSelectFlatNode();

        flatNode.name = node.name;
        flatNode.value = node.value;
        flatNode.parent = parent ?? undefined;
        flatNode.level = level;
        flatNode.expandable = !!node.children;

        return flatNode;
    };

    protected getLevel = (node: KbqTreeSelectFlatNode) => node.level;

    protected isExpandable = (node: KbqTreeSelectFlatNode) => node.expandable;

    protected getChildren = (node: KbqTreeSelectNode): KbqTreeSelectNode[] | null => node.children;

    protected getValue = (node: KbqTreeSelectFlatNode): unknown => node.value;

    protected getViewValue = (node: KbqTreeSelectFlatNode): string => `${node.name}`;
}
