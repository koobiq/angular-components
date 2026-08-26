import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { createSearchPredicate, KbqHighlightModule, tokenizeSearchQuery } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import {
    defaultCompareValues,
    FlatTreeControl,
    KbqTreeFlatDataSource,
    KbqTreeFlattener,
    KbqTreeModule
} from '@koobiq/components/tree';
import { KbqTreeSelectModule } from '@koobiq/components/tree-select';

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
        'components-dev': {
            alert: '',
            badge: ''
        },
        'koobiq-examples': '',
        'koobiq-moment-adapter': '',
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

/**
 * @title Tree-select smart search
 */
@Component({
    selector: 'tree-select-search-smart-example',
    imports: [
        KbqTreeSelectModule,
        FormsModule,
        ReactiveFormsModule,
        KbqIconModule,
        KbqInputModule,
        KbqTreeModule,
        KbqHighlightModule
    ],
    template: `
        <kbq-form-field>
            <kbq-tree-select [multiple]="true" [(ngModel)]="selected">
                <kbq-form-field noBorders kbqSelectSearch>
                    <i kbq-icon="kbq-magnifying-glass_16" kbqPrefix></i>
                    <input kbqInput type="text" [formControl]="searchControl" />
                    <kbq-cleaner />
                </kbq-form-field>

                <div kbq-select-search-empty-result>Ничего не найдено</div>

                <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                        <span
                            [innerHTML]="treeControl.getViewValue(node) | kbqHighlightBackground: searchTokens : true"
                        ></span>
                    </kbq-tree-option>

                    <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                        <i
                            kbq-icon="kbq-chevron-down-s_16"
                            kbqTreeNodeToggle
                            [style.transform]="treeControl.isExpanded(node) ? '' : 'rotate(-90deg)'"
                        ></i>
                        <span
                            [innerHTML]="treeControl.getViewValue(node) | kbqHighlightBackground: searchTokens : true"
                        ></span>
                    </kbq-tree-option>
                </kbq-tree-selection>

                <kbq-cleaner />
            </kbq-tree-select>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeSelectSearchSmartExample implements OnInit {
    selected = '';

    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: KbqTreeFlattener<FileNode, FileFlatNode>;

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    searchControl: FormControl = new FormControl();

    protected searchTokens: string[] = [];

    private lastQuery: string | null = null;
    private lastPredicate: (value: string) => boolean = () => true;

    constructor() {
        this.treeFlattener = new KbqTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);

        this.treeControl = new FlatTreeControl<FileFlatNode>(
            this.getLevel,
            this.isExpandable,
            this.getValue,
            this.getViewValue,
            defaultCompareValues,
            this.compareViewValues
        );
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.dataSource.data = buildFileTree(DATA_OBJECT, 0);
    }

    ngOnInit(): void {
        this.searchControl.valueChanges.subscribe((value) => this.treeControl.filterNodes(value));
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }

    /**
     * `compareViewValues` is invoked once per node on every filter pass, so both the predicate and
     * `searchTokens` are rebuilt only when the query actually changes, not for every node — the latter
     * also keeps the reference stable between change-detection passes, which the highlight pipes rely
     * on for memoization.
     */
    private compareViewValues = (viewValue: string, query: string): boolean => {
        if (query !== this.lastQuery) {
            this.lastQuery = query;
            this.lastPredicate = createSearchPredicate(query ?? '');
            this.searchTokens = tokenizeSearchQuery(query ?? '');
        }

        return this.lastPredicate(viewValue);
    };

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
        return `${node.name} view`;
    };
}
