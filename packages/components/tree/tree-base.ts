import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import {
    AfterContentChecked,
    AfterContentInit,
    ChangeDetectorRef,
    DestroyRef,
    Directive,
    ElementRef,
    EmbeddedViewRef,
    Input,
    IterableChangeRecord,
    IterableDiffer,
    IterableDiffers,
    OnDestroy,
    OnInit,
    Signal,
    TrackByFunction,
    ViewChild,
    ViewContainerRef,
    contentChildren,
    inject,
    input,
    isDevMode
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IFocusableOption, KbqStateSaving } from '@koobiq/components/core';
import { BehaviorSubject, Observable, Subject, Subscription, of as observableOf } from 'rxjs';
import { FlatTreeControl } from './control/flat-tree-control';
import { TreeControl } from './control/tree-control';
import { KbqTreeNodeDef, KbqTreeNodeOutletContext } from './node';
import { KbqTreeNodeOutlet } from './outlet';
import {
    getTreeControlMissingError,
    getTreeMissingMatchingNodeDefError,
    getTreeMultipleDefaultNodeDefsError,
    getTreeNoValidDataSourceError
} from './tree-errors';

/** The persisted state of a tree — the values of the nodes that were expanded. */
export type KbqTreeState = string[];

/**
 * Coerces a raw persisted payload into a `KbqTreeState`, returning `null` for anything unrecognizable.
 *
 * Web storage is origin-wide and user-writable, so a payload is never trusted — without this, an entry
 * such as `{"a": null}` would reach `hasValue()` while restoring.
 */
const normalizeTreeState = (parsed: unknown): KbqTreeState | null => {
    if (!Array.isArray(parsed)) return null;

    const values = parsed.filter((value): value is string => typeof value === 'string');

    // An array that held nothing usable is somebody else's payload, not "nothing was expanded" — the
    // difference matters, because only the second one is a state worth keeping.
    return values.length || !parsed.length ? values : null;
};

/**
 * Rendering core of the tree.
 *
 * Originally forked from `@angular/cdk/tree` and maintained independently since: the node/outlet
 * contract, the option-based selection model and the filtering pipeline have all diverged, so
 * `@angular/cdk/tree` is deliberately not a dependency of this package and upstream fixes have to be
 * ported by hand.
 */
@Directive()
export class KbqTreeBase<T> implements AfterContentChecked, AfterContentInit, CollectionViewer, OnDestroy, OnInit {
    protected differs = inject(IterableDiffers);
    protected changeDetectorRef = inject(ChangeDetectorRef);

    /**
     * Persistence of the expanded state, applied as a host directive by the concrete tree components.
     * `useStateSaving` and `stateSavingKey` are its inputs, forwarded onto the tree.
     *
     * Optional because `KbqTreeBase` is exported: a tree that does not apply the directive persists
     * nothing instead of failing to construct.
     */
    private readonly stateSaving = inject(KbqStateSaving, { optional: true });

    // TODO: Skipped for migration because:
    //  Subclass KbqTreeSelection overrides this input with a narrower type
    //  (FlatTreeControl<any>) via `@Input() declare`, which is incompatible
    //  with InputSignal<TreeControl<T>>. Migrate together as a follow-up.
    @Input() treeControl: TreeControl<T>;

    /**
     * Tracking function that will be used to check the differences in data changes. Used similarly
     * to `ngFor` `trackBy` function. Optimize node operations by identifying a node based on its data
     * relative to the function to know if a node should be added/removed/moved.
     * Accepts a function that takes two parameters, `index` and `item`.
     *
     * Views are reused for nodes the function reports as unchanged, which a data source that rebuilds
     * its node objects on every emission — a flattener among them — otherwise cannot get.
     */
    readonly trackBy = input<TrackByFunction<T>>(undefined!);

    // Outlets within the tree's template where the dataNodes will be inserted.
    @ViewChild(KbqTreeNodeOutlet, { static: true }) nodeOutlet: KbqTreeNodeOutlet;

    /** The tree node template for the tree */
    readonly nodeDefs: Signal<readonly KbqTreeNodeDef<T>[]> = contentChildren(KbqTreeNodeDef);

    /**
     * Stream containing the latest information on what rows are being displayed on screen.
     * Can be used by the data source to as a heuristic of what data should be provided.
     *
     * The tree renders every expanded node eagerly, so the window is the whole data set; a data source
     * cannot use it to page or virtualize. Windowing would have to emit a real range from a scroll
     * listener here first.
     */
    viewChange = new BehaviorSubject<{ start: number; end: number }>({ start: 0, end: Number.MAX_VALUE });

    /** Differ used to find the changes in the data provided by the data source. */
    protected dataDiffer: IterableDiffer<T>;

    /** Stores the node definition that does not have a when predicate. */
    private defaultNodeDef: KbqTreeNodeDef<T> | null;

    /** Data subscription */
    private dataSubscription: Subscription | null;

    /** Level of nodes */
    private levels: Map<T, number> = new Map<T, number>();

    /** Most recently constructed node of this tree, see `registerNode`. */
    private recentNode: KbqTreeNode<T> | null = null;

    /** Node rendered for a given outlet context, so a reused view can be handed its new data. */
    private readonly nodesByContext = new WeakMap<KbqTreeNodeOutletContext<T>, KbqTreeNode<T>>();

    /**
     * Values from the persisted state whose node has not appeared in `treeControl.dataNodes` yet.
     *
     * A tree whose data arrives asynchronously has only its roots when it reads, so the rest is applied
     * as the nodes named by it show up. A value is dropped the first time its node is seen, so a branch
     * the user collapses afterwards is not expanded again by the next batch of data.
     */
    private pendingValues = new Set<string>();

    /** The `dataNodes` the last restore ran against, so an unchanged list is not walked again. */
    private lastRestoredDataNodes: readonly T[] | null = null;

    /**
     * Whether the persisted state has been read. `KbqTreeSelect` calls `ngAfterContentInit()` by hand on
     * the tree it projects into its panel, and a second read would resurrect values the user dismissed.
     */
    private hasRead = false;

    /** Whether the dev-mode warnings below have already been logged, so each is logged once. */
    private warnedAboutTreeControl = false;
    private warnedAboutValues = false;

    /**
     * Provides a stream containing the latest data array to render. Influenced by the tree's
     * stream of view window (what dataNodes are currently on screen).
     * Data source can be an observable of data array, or a data array to render.
     */
    // TODO: Skipped for migration because:
    //  The setter switches the data subscription, which an `input()` cannot express on its own.
    @Input()
    get dataSource(): DataSource<T> | Observable<T[]> | T[] | null {
        return this._dataSource;
    }

    set dataSource(dataSource: DataSource<T> | Observable<T[]> | T[] | null) {
        if (this._dataSource !== dataSource) {
            this.switchDataSource(dataSource);
        }
    }

    private _dataSource: DataSource<T> | Observable<T[]> | T[] | null;

    protected readonly destroyRef = inject(DestroyRef);

    /** Whether `ngOnInit` has run, i.e. every initial input binding has been applied. */
    private initialized = false;

    ngOnInit() {
        this.dataDiffer = this.createDataDiffer();

        if (!this.treeControl) {
            throw getTreeControlMissingError();
        }

        this.initialized = true;
    }

    ngAfterContentInit(): void {
        // Before `ngAfterContentChecked` connects the data source, so the restored nodes are expanded
        // ahead of the first render rather than causing a second one.
        if (this.hasRead || !this.persists) return;

        this.hasRead = true;

        // Moving the tree to another key means its expansion lives there now: restore from it, rather than
        // keeping what the previous key held and writing nothing.
        this.stateSaving!.keyChanges.subscribe(() => this.restoreState());

        this.restoreState();
    }

    /** Reads the persisted expansion and applies it. Runs while initializing, and again on a key change. */
    private restoreState(): void {
        if (!this.persists) return;

        const savedState = this.stateSaving!.read(normalizeTreeState);

        this.pendingValues = new Set(savedState ?? []);

        // The memo that keeps one batch of nodes from being examined twice. A restore from another key
        // has new values to match against the same nodes, so it has to be allowed to look again.
        this.lastRestoredDataNodes = null;

        this.restorePending();
    }

    ngOnDestroy() {
        this.nodeOutlet.viewContainer.clear();

        if (this._dataSource && typeof (this.dataSource as DataSource<T>).disconnect === 'function') {
            (this.dataSource as DataSource<T>).disconnect(this);
        }

        if (this.dataSubscription) {
            this.dataSubscription.unsubscribe();
            this.dataSubscription = null;
        }
    }

    ngAfterContentChecked() {
        const defaultNodeDefs = this.nodeDefs().filter((def) => !def.when);

        if (defaultNodeDefs.length > 1) {
            throw getTreeMultipleDefaultNodeDefsError();
        }

        this.defaultNodeDef = defaultNodeDefs[0];

        if (this.dataSource && this.nodeDefs().length && !this.dataSubscription) {
            this.observeRenderChanges();
        }
    }

    /**
     * Persists the values of the currently expanded nodes.
     *
     * Called for every expansion and collapse a user performs. Expansion driven by the application —
     * `treeControl.expandAll()`, or writing to `expansionModel` directly — is not persisted on its own;
     * call this afterwards to record it.
     *
     * A no-op while a filter is active: `filterNodes()` rewrites the expansion set to "every expandable
     * node that matched" and puts the real one back afterwards, so what is expanded during a search is a
     * view of the results rather than a state worth keeping.
     */
    saveState(): void {
        if (!this.persists || this.treeControl.filterValue.value?.length) return;

        this.stateSaving!.write(this.expandedValues());
    }

    /**
     * Removes the state persisted for this tree.
     *
     * Persistence itself stays on — the next expansion is written again. Unset `useStateSaving` to stop
     * it.
     */
    clearSavedState(): void {
        this.stateSaving?.clear();
    }

    /**
     * Whether state is currently persisted for this tree — restored on init, or written since.
     * Always `false` while `useStateSaving` is unset, and `false` again after `clearSavedState()`.
     */
    get hasSavedState(): boolean {
        return this.stateSaving?.state != null;
    }

    /** Check for changes made in the data and render each change (node added/removed/moved). */
    renderNodeChanges(
        data: T[] | ReadonlyArray<T>,
        dataDiffer: IterableDiffer<T> = this.dataDiffer,
        viewContainer: ViewContainerRef = this.nodeOutlet.viewContainer,
        parentData?: T
    ) {
        if (this.applyNodeChanges(data, dataDiffer, viewContainer, parentData)) {
            this.changeDetectorRef.detectChanges();
        }
    }

    /**
     * Applies the data changes to the view container without running change detection, and reports
     * whether anything moved. Split out of `renderNodeChanges` so a subclass can update the state its
     * own template reads before the single change-detection pass, instead of running a second one.
     * @docs-private
     */
    protected applyNodeChanges(
        data: T[] | ReadonlyArray<T>,
        dataDiffer: IterableDiffer<T>,
        viewContainer: ViewContainerRef,
        parentData?: T
    ): boolean {
        const changes = dataDiffer.diff(data);

        if (!changes) {
            return false;
        }

        changes.forEachOperation(
            (item: IterableChangeRecord<T>, adjustedPreviousIndex: number | null, currentIndex: number | null) => {
                if (item.previousIndex == null) {
                    this.insertNode(data[currentIndex!], currentIndex!, viewContainer, parentData);
                } else if (currentIndex == null) {
                    viewContainer.remove(adjustedPreviousIndex!);
                    this.levels.delete(item.item);
                } else {
                    const view = viewContainer.get(adjustedPreviousIndex!);

                    viewContainer.move(view!, currentIndex);
                }
            }
        );

        // A node kept its identity but is a different object — what a data source that rebuilds its
        // nodes on every emission produces, a flattener among them. The view is reused, so the object
        // it and its `KbqTreeNode` still hold is gone from `dataNodes`, and every lookup keyed on the
        // node reference (`getDescendants`, `isExpanded`, the selection) would miss it.
        changes.forEachIdentityChange((record: IterableChangeRecord<T>) => {
            this.refreshNodeData(viewContainer, record.currentIndex!, record.item);
        });

        return true;
    }

    private refreshNodeData(viewContainer: ViewContainerRef, index: number, nodeData: T): void {
        const view = viewContainer.get(index) as EmbeddedViewRef<KbqTreeNodeOutletContext<T>> | null;

        if (!view) {
            return;
        }

        const { context } = view;
        const previousData = context.$implicit;

        context.$implicit = nodeData;

        this.levels.delete(previousData);
        this.levels.set(nodeData, context.level);

        const node = this.nodesByContext.get(context);

        if (node) {
            node.data = nodeData;
            node.refresh();
        }
    }

    /**
     * Finds the matching node definition that should be used for this node data. If there is only
     * one node definition, it is returned. Otherwise, find the node definition that has a when
     * predicate that returns true with the data. If none return true, return the default node
     * definition.
     */
    getNodeDef(data: T, i: number): KbqTreeNodeDef<T> {
        const nodeDefs = this.nodeDefs();

        if (nodeDefs.length === 1) {
            return nodeDefs[0];
        }

        const nodeDef = nodeDefs.find((def) => def.when && def.when(i, data)) || this.defaultNodeDef;

        if (!nodeDef) {
            throw getTreeMissingMatchingNodeDefError();
        }

        return nodeDef;
    }

    /**
     * Create the embedded view for the data node template and place it in the correct index location
     * within the data node view container.
     */
    insertNode(nodeData: T, index: number, viewContainer?: ViewContainerRef, parentData?: T) {
        const node = this.getNodeDef(nodeData, index);

        // Node context that will be provided to created embedded view
        const context = new KbqTreeNodeOutletContext<T>(nodeData);

        // If the tree is flat tree, then use the `getLevel` function in flat tree control
        // Otherwise, use the level of parent node.
        const treeControl = this.treeControl;

        if (treeControl.getLevel) {
            context.level = treeControl.getLevel(nodeData);
        } else if (typeof parentData !== 'undefined' && this.levels.has(parentData)) {
            context.level = this.levels.get(parentData)! + 1;
        } else {
            context.level = 0;
        }

        this.levels.set(nodeData, context.level);

        // Use default tree nodeOutlet, or nested node's nodeOutlet
        const container = viewContainer ? viewContainer : this.nodeOutlet.viewContainer;

        container.createEmbeddedView(node.template, context, index);

        // The `KbqTreeNode` instantiated by `createEmbeddedView` registers itself here on construction,
        // which is the only handle onto it — the embedded view exposes its context, not its directives.
        // It is remembered against that context so a later re-render can reach it again.
        if (this.recentNode) {
            this.recentNode.data = nodeData;
            this.nodesByContext.set(context, this.recentNode);
            this.recentNode = null;
        }
    }

    /**
     * Called by a `KbqTreeNode` while it is being constructed, so `insertNode` can hand it its data.
     * @docs-private
     */
    registerNode(node: KbqTreeNode<T>): void {
        this.recentNode = node;
    }

    /** Whether this tree reads and writes its expanded state at all. */
    private get persists(): boolean {
        if (!this.stateSaving?.useStateSaving()) return false;

        // A tree that is not in the document has no stable key — the default resolver derives one from
        // the path to `<body>`. That is the ordinary state of a tree projected into an overlay, such as
        // the one `kbq-tree-select` renders into its panel, whose expansion is transient UI rather than
        // a setting worth carrying to the next visit.
        if (!this.stateSaving.host?.isConnected) return false;

        if (typeof (this.treeControl as FlatTreeControl<T>).getValue !== 'function') {
            if (isDevMode() && !this.warnedAboutTreeControl) {
                this.warnedAboutTreeControl = true;

                // eslint-disable-next-line no-console
                console.warn(
                    'kbq-tree: state saving is enabled, but the tree control has no `getValue`. ' +
                        'Expansion is persisted by node value, and a node object does not survive a ' +
                        'reload, so nothing is persisted. Use `FlatTreeControl`, or unset ' +
                        '`useStateSaving`.'
                );
            }

            return false;
        }

        return true;
    }

    /**
     * Expands every pending value whose node is present, and stops tracking it.
     *
     * Idempotent, and safe to call on every render: the pending set only shrinks, so a tree that has
     * restored everything does no work at all.
     */
    private restorePending(): void {
        if (!this.pendingValues.size) return;

        const currentNodes = this.treeControl.dataNodes;

        // Nothing new to match against. Deliberately does not record an empty list, so the first real
        // batch of an asynchronously loaded tree is still examined.
        if (currentNodes === this.lastRestoredDataNodes || !currentNodes?.length) return;

        this.lastRestoredDataNodes = currentNodes;

        const treeControl = this.treeControl as FlatTreeControl<T>;
        const found: T[] = [];

        for (const value of this.pendingValues) {
            const node = treeControl.hasValue(value);

            if (node) {
                found.push(node);
                this.pendingValues.delete(value);
            }
        }

        // Straight at the model rather than through `expand()`, which is a no-op while a filter is
        // active — restoring must not depend on what the user happens to be searching for.
        if (found.length) {
            this.stateSaving!.applying(() => treeControl.expansionModel.select(...found));
        }
    }

    /** The values of the nodes that are currently expanded, plus the ones still waiting to appear. */
    private expandedValues(): KbqTreeState {
        const treeControl = this.treeControl as FlatTreeControl<T>;
        const expanded: string[] = [];
        let skipped = false;

        for (const node of treeControl.expansionModel.selected) {
            const value = treeControl.getValue(node);

            if (typeof value === 'string') {
                expanded.push(value);
            } else {
                skipped = true;
            }
        }

        if (skipped && isDevMode() && !this.warnedAboutValues) {
            this.warnedAboutValues = true;

            // eslint-disable-next-line no-console
            console.warn(
                'kbq-tree: `getValue` returned a value that is not a string for at least one node. ' +
                    'Expansion is persisted as JSON keyed by that value, so those nodes are left out.'
            );
        }

        // Union with what is still pending: on a tree whose data arrives in batches the expanded nodes
        // are only part of what was saved, and writing the snapshot alone would drop every branch that
        // has not been loaded yet.
        return [...new Set([...expanded, ...this.pendingValues])];
    }

    /** Set up a subscription for the data provided by the data source. */
    private observeRenderChanges() {
        let dataStream: Observable<T[] | ReadonlyArray<T>> | undefined;

        // Cannot use `instanceof DataSource` since the data source could be a literal with
        // `connect` function and may not extends DataSource.
        if (typeof (this._dataSource as DataSource<T>).connect === 'function') {
            dataStream = (this._dataSource as DataSource<T>).connect(this);
        } else if (this._dataSource instanceof Observable) {
            dataStream = this._dataSource;
        } else if (Array.isArray(this._dataSource)) {
            dataStream = observableOf(this._dataSource);
        }

        if (dataStream) {
            this.dataSubscription = dataStream.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
                this.renderNodeChanges(data);

                // On a microtask, and only while something is still pending: expanding re-enters this
                // very subscription — the flat data source merges `expansionModel.changed` — and
                // `renderNodeChanges` has just run `detectChanges()`.
                if (this.pendingValues.size) {
                    Promise.resolve().then(() => this.restorePending());
                }
            });
        } else {
            throw getTreeNoValidDataSourceError();
        }
    }

    /**
     * Switch to the provided data source by resetting the data and unsubscribing from the current
     * render change subscription if one exists. If the data source is null, interpret this by
     * clearing the node outlet. Otherwise start listening for new data.
     */
    private switchDataSource(dataSource: DataSource<T> | Observable<T[]> | T[] | null) {
        if (this._dataSource && typeof (this._dataSource as DataSource<T>).disconnect === 'function') {
            (this.dataSource as DataSource<T>).disconnect(this);
        }

        if (this.dataSubscription) {
            this.dataSubscription.unsubscribe();
            this.dataSubscription = null;
        }

        // Every rendered node belongs to the previous source, so none of them survives the switch. The
        // differ is reset below and no longer reports them as removals, which makes these two the only
        // things that drop the old nodes — for a null source and for a replacement source alike. Left
        // to the differ, `levels` would keep an entry, and with it a strong reference, for every node
        // of every source the tree has ever been given.
        this.nodeOutlet.viewContainer.clear();
        this.levels.clear();

        this._dataSource = dataSource;

        // The differ remembers the nodes of the previous source. Left in place, the first diff against
        // the new source is computed as a delta from data that is no longer rendered, so views are
        // reused for unrelated nodes or dropped entirely.
        this.dataDiffer = this.createDataDiffer();

        // Not before `ngOnInit`: inputs are set one by one, and a template binding `dataSource` ahead of
        // `treeControl` would have this subscribe — and render — while `treeControl` is still undefined.
        // The first emission would then throw inside the node directives and take the subscription down
        // with it, leaving the tree permanently empty. The initial render is picked up by
        // `ngAfterContentChecked`; a later source swap is observed here right away.
        if (dataSource && this.initialized && this.nodeDefs().length) {
            this.observeRenderChanges();
        }
    }

    private createDataDiffer(): IterableDiffer<T> {
        return this.differs.find([]).create(this.trackBy());
    }
}

// `KbqTree` declares `role="tree"`, whose owned elements have to be `treeitem`s — and a bare
// `kbq-tree-node` is the only kind of row it can render, since `KbqTreeOption` needs a parent only
// `KbqTreeSelection` provides. The nodes are rendered flat into a single outlet, so the depth an AT
// reports comes from `aria-level` rather than from the DOM.
@Directive({
    selector: 'kbq-tree-node',
    host: {
        role: 'treeitem',
        '[attr.aria-level]': 'level + 1'
    },
    exportAs: 'kbqTreeNode'
})
export class KbqTreeNode<T> implements IFocusableOption, OnDestroy {
    protected elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    tree = inject<KbqTreeBase<T>>(KbqTreeBase);

    /**
     * The most recently created `KbqTreeNode`, across every tree on the page.
     *
     * @deprecated Kept for backwards compatibility only — the tree hands a node its data through
     * `KbqTreeBase.registerNode`, which is scoped to the tree that owns the node. Will be removed in
     * version 20.
     */
    static mostRecentTreeNode: KbqTreeNode<any> | null = null;

    protected destroyed = new Subject<void>();

    /**
     * Emits after the tree reused this node's view for a different data object, so a directive on the
     * same element can re-derive what it computed from the previous one.
     * @docs-private
     */
    readonly refreshed = new Subject<void>();

    get data(): T {
        return this._data;
    }

    set data(value: T) {
        this._data = value;
    }

    private _data: T;

    get isExpanded(): boolean {
        return this.tree.treeControl.isExpanded(this.data);
    }

    get level(): number {
        const treeControl = this.tree.treeControl;

        return treeControl.getLevel ? treeControl.getLevel(this._data) : 0;
    }

    constructor() {
        KbqTreeNode.mostRecentTreeNode = this;

        this.tree.registerNode(this);
    }

    ngOnDestroy() {
        this.destroyed.next();
        this.destroyed.complete();

        this.refreshed.complete();
    }

    /**
     * Called by the tree once `data` has been replaced on a reused view. State a subclass derived from
     * the previous node — its value, its level — is stale at this point and has to be recomputed.
     * @docs-private
     */
    refresh(): void {
        this.refreshed.next();
    }

    focus(): void {
        this.elementRef.nativeElement.focus();
    }
}
