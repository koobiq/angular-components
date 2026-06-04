import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqHighlightModule } from '@koobiq/components/core';
import { KbqInputModule } from '@koobiq/components/input';
import {
    FlatTreeControl,
    FlatTreeControlFilter,
    KbqTreeFlatDataSource,
    KbqTreeFlattener,
    KbqTreeModule
} from '@koobiq/components/tree';

export class FileNode {
    children: FileNode[];
    name: string;
    type: any;
}

/** Flat node with expandable and level information */
export class FileFlatNode {
    name: string;
    type: any;
    level: number;
    expandable: boolean;
    parent: any;
}

/**
 * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
 * The return value is the list of `FileNode`.
 */
export function buildFileTree(value: any, level: number): FileNode[] {
    const data: any[] = [];

    for (const k of Object.keys(value)) {
        const v = value[k];
        const node = new FileNode();

        node.name = `${k}`;

        if (v === null || v === undefined) {
            // no action
        } else if (typeof v === 'object') {
            node.children = buildFileTree(v, level + 1);
        } else {
            node.type = v;
        }

        data.push(node);
    }

    return data;
}

export const DATA_OBJECT = {
    docs: 'app',
    src: {
        cdk: {
            a11ly: {
                'aria describer': {
                    'aria-describer': 'ts',
                    'aria-describer.spec': 'ts',
                    'aria-reference': 'ts',
                    'aria-reference.spec': 'ts'
                },
                'focus monitor': {
                    'focus-monitor': 'ts',
                    'focus-monitor.spec': 'ts'
                }
            }
        },
        documentation: {
            source: '',
            tools: ''
        },
        mosaic: {
            autocomplete: '',
            button: '',
            'button-toggle': '',
            index: 'ts',
            package: 'json',
            version: 'ts'
        },
        'mosaic-dev': {
            alert: '',
            badge: ''
        },
        'mosaic-examples': '',
        'mosaic-moment-adapter': '',
        README: 'md',
        'tsconfig.build': 'json'
    },
    scripts: {
        deploy: {
            'cleanup-preview': 'ts',
            'publish-artifacts': 'sh',
            'publish-docs': 'sh',
            'publish-docs-preview': 'ts'
        },
        'tsconfig.deploy': 'json'
    },
    tests: ''
};

export class CustomTreeControlFilter<T> implements FlatTreeControlFilter<T> {
    result: T[];

    constructor(private control: FlatTreeControl<T>) {}

    handle(value: string | null): T[] {
        if (!value) {
            this.result = [];

            return this.result;
        }

        const result: Set<T> = new Set();

        const foundedNodes = this.control.dataNodes.filter((node: any) => {
            return this.control.compareViewValues(this.control.getViewValue(node), value);
        });

        foundedNodes.forEach((filteredNode) => {
            this.control.getParents(filteredNode, []).forEach((node) => result.add(node));

            result.add(filteredNode);
        });

        this.result = Array.from(result);

        return this.result;
    }
}

/**
 * @title Tree custom filtering
 */
@Component({
    selector: 'tree-custom-filtering-example',
    imports: [KbqInputModule, FormsModule, KbqTreeModule, KbqHighlightModule],
    template: `
        <kbq-form-field>
            <input
                kbqInput
                type="text"
                placeholder="Search"
                [(ngModel)]="filterValue"
                (ngModelChange)="onFilterChange($event)"
            />
        </kbq-form-field>
        <kbq-tree-selection
            class="layout-margin-top-m"
            [dataSource]="dataSource"
            [treeControl]="treeControl"
            [(ngModel)]="modelValue"
        >
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding [disabled]="node.name === 'tests'">
                <span [innerHTML]="treeControl.getViewValue(node) | mcHighlight: treeControl.filterValue.value"></span>
            </kbq-tree-option>

            <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                <kbq-tree-node-toggle [node]="node" (click)="onChevronClick(node, $event)" />

                <span [innerHTML]="treeControl.getViewValue(node) | mcHighlight: treeControl.filterValue.value"></span>
            </kbq-tree-option>
        </kbq-tree-selection>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeCustomFilteringExample {
    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: KbqTreeFlattener<FileNode, FileFlatNode>;

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    modelValue: any = '';
    filterValue: string = '';

    /** Folders (matches) the user manually expanded while a filter is active. */
    readonly expandedMatches = signal(new Set<FileFlatNode>());

    /** Nodes whose own view value matches the current query (excludes ancestors). Only these can be expanded by the user. */
    private baseMatches = new Set<FileFlatNode>();

    private readonly customFilter: CustomTreeControlFilter<FileFlatNode>;

    constructor() {
        this.treeFlattener = new KbqTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);

        this.treeControl = new FlatTreeControl<FileFlatNode>(
            this.getLevel,
            this.isExpandable,
            this.getValue,
            this.getViewValue
        );

        this.customFilter = new CustomTreeControlFilter<FileFlatNode>(this.treeControl);
        this.treeControl.setFilters(this.customFilter);

        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.dataSource.data = buildFileTree(DATA_OBJECT, 0);

        // Reset expanded + match state whenever the filter goes idle.
        this.treeControl.filterValue.subscribe((value) => {
            if (!this.isFilterActive(value)) {
                this.expandedMatches.set(new Set());
                this.baseMatches = new Set();
            }
        });
    }

    onFilterChange(value: string): void {
        // Each new query starts from a clean expanded state.
        this.expandedMatches.set(new Set());
        this.baseMatches = this.computeBaseMatches(value);
        this.treeControl.filterNodes(value);

        if (this.baseMatches.size > 0) {
            // FlatTreeControl.filterNodes auto-selects every expandable node in the filter result
            // (matches + ancestors). For not-yet-expanded MATCH folders the chevron should read "collapsed"
            // because no children are visible yet — deselect them. Ancestors keep their selection so
            // the chevron correctly shows "expanded" (the path to the match IS visible).
            //
            // The deselect is deferred to a microtask so it runs AFTER `updateFilterValue`'s
            // Promise.resolve callback has set `filterValue.value`. Otherwise `expansionModel.changed`
            // here would route through the data source's `expansionHandler` and our work would be
            // overwritten when filterValue is later set.
            Promise.resolve().then(() => {
                let mutated = false;

                this.baseMatches.forEach((match) => {
                    if (this.treeControl.isExpandable(match) && this.treeControl.expansionModel.isSelected(match)) {
                        this.treeControl.expansionModel.deselect(match);
                        mutated = true;
                    }
                });

                if (mutated) {
                    // Refresh the filter rendering after expansionModel mutation.
                    this.treeControl.filterValue.next(this.treeControl.filterValue.value);
                }
            });
        }
    }

    /**
     * Fires on every click on `<kbq-tree-node-toggle>`. When no filter is active the toggle's own
     * host handler runs and the early `return` here makes us a no-op. When a filter is active the
     * toggle disables itself, so we take over and update the expanded set — but only for nodes that
     * actually match the search query (ancestors and revealed siblings cannot be expanded).
     */
    onChevronClick(node: FileFlatNode, event: Event): void {
        if (!this.isFilterActive(this.treeControl.filterValue.value)) return;

        // Only nodes whose own view value matches the query can be expanded.
        if (!this.baseMatches.has(node)) {
            event.stopPropagation();

            return;
        }

        event.stopPropagation();

        const next = new Set(this.expandedMatches());

        if (next.has(node)) {
            next.delete(node);
            // Mirror to expansionModel so the chevron rotates back to "collapsed".
            this.treeControl.expansionModel.deselect(node);
            // Collapsing a parent must also drop any nested expanded descendants.
            Array.from(next).forEach((expanded) => {
                if (this.isDescendantOf(expanded, node)) {
                    next.delete(expanded);
                    this.treeControl.expansionModel.deselect(expanded);
                }
            });
        } else {
            next.add(node);
            // Mirror to expansionModel so the chevron rotates to "expanded".
            this.treeControl.expansionModel.select(node);
        }

        this.expandedMatches.set(next);
        this.rebuildFilterVisible();
    }

    private computeBaseMatches(value: string | null): Set<FileFlatNode> {
        if (!value) return new Set();

        return new Set(
            this.treeControl.dataNodes.filter((node) =>
                this.treeControl.compareViewValues(this.treeControl.getViewValue(node), value)
            )
        );
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }

    private isFilterActive(value: string | FileFlatNode[] | null): boolean {
        return Array.isArray(value) ? value.length > 0 : !!value;
    }

    /**
     * Recomputes `filterModel` as `customFilter.handle(query) ∪ direct children of each expanded folder`,
     * preserves hierarchical order, and re-emits `filterValue` so the data source rebuilds via
     * `filterHandler()`.
     */
    private rebuildFilterVisible(): void {
        const query = this.filterValue;
        const base = this.customFilter.handle(query);
        const combined = new Set<FileFlatNode>(base);

        this.expandedMatches().forEach((expanded) => {
            const childLevel = this.treeControl.getLevel(expanded) + 1;

            this.treeControl.getDescendants(expanded).forEach((descendant) => {
                if (this.treeControl.getLevel(descendant) === childLevel) {
                    combined.add(descendant);
                }
            });
        });

        // Preserve hierarchical (dataNodes) order so expanded children render next to their parent.
        const ordered = this.treeControl.dataNodes.filter((n) => combined.has(n));

        this.treeControl.filterModel.clear();
        this.treeControl.filterModel.select(...ordered);

        this.treeControl.filterValue.next(this.treeControl.filterValue.value);
    }

    /** Walks `node.parent` upward; returns true if `ancestor` is reached. */
    private isDescendantOf(node: FileFlatNode, ancestor: FileFlatNode): boolean {
        let parent = node.parent;

        while (parent) {
            if (parent === ancestor) return true;

            parent = parent.parent;
        }

        return false;
    }

    private transformer = (node: FileNode, level: number, parent: any) => {
        const flatNode = new FileFlatNode();

        flatNode.name = node.name;
        flatNode.parent = parent;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children;

        return flatNode;
    };

    private getLevel = (node: FileFlatNode) => {
        return node.level;
    };

    private isExpandable = (node: FileFlatNode) => {
        return node.expandable;
    };

    private getChildren = (node: FileNode): FileNode[] => {
        return node.children;
    };

    private getValue = (node: FileFlatNode): string => {
        return node.name;
    };

    private getViewValue = (node: FileFlatNode): string => {
        const nodeType = node.type ? `.${node.type}` : '';

        return `${node.name}${nodeType}`;
    };
}
