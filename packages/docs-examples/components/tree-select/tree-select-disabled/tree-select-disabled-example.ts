import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqIconModule } from '@koobiq/components/icon';
import {
    defaultCompareValues,
    defaultCompareViewValues,
    FlatTreeControl,
    KbqTreeFlatDataSource,
    KbqTreeFlattener,
    KbqTreeModule
} from '@koobiq/components/tree';
import { KbqTreeSelectModule } from '@koobiq/components/tree-select';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

export class FileNode {
    children?: FileNode[];
    name = '';
    type: any;
}

/** Flat node with expandable and level information */
export class FileFlatNode {
    name = '';
    type: any;
    level = 0;
    expandable = false;
    parent: any;
    disabled = false;
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

/** Names of the nodes the example disables. */
const DISABLED_NODE_NAMES = ['mosaic', 'README', 'tests'];

/**
 * @title Tree-select disabled
 */
@Component({
    selector: 'tree-select-disabled-example',
    imports: [FormsModule, KbqTreeModule, KbqTreeSelectModule, KbqIconModule],
    template: `
        <div class="example-row">
            <div class="kbq-form__label">{{ t().forSelect }}</div>
            <kbq-form-field>
                <kbq-tree-select disabled [placeholder]="t().placeholder" [(ngModel)]="selectedForSelect">
                    <kbq-tree-selection [dataSource]="forSelectDataSource" [treeControl]="forSelectTreeControl">
                        <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                            {{ forSelectTreeControl.getViewValue(node) }}
                        </kbq-tree-option>

                        <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                            <i
                                kbq-icon="kbq-chevron-down-s_16"
                                kbqTreeNodeToggle
                                [style.transform]="forSelectTreeControl.isExpanded(node) ? '' : 'rotate(-90deg)'"
                            ></i>
                            {{ forSelectTreeControl.getViewValue(node) }}
                        </kbq-tree-option>
                    </kbq-tree-selection>
                </kbq-tree-select>
            </kbq-form-field>
        </div>

        <div class="example-row">
            <div class="kbq-form__label">{{ t().forOptions }}</div>
            <kbq-form-field>
                <kbq-tree-select [placeholder]="t().placeholder" [(ngModel)]="selectedForOptions">
                    <kbq-tree-selection [dataSource]="forOptionsDataSource" [treeControl]="forOptionsTreeControl">
                        <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                            {{ forOptionsTreeControl.getViewValue(node) }}
                        </kbq-tree-option>

                        <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                            <i
                                kbq-icon="kbq-chevron-down-s_16"
                                kbqTreeNodeToggle
                                [style.transform]="forOptionsTreeControl.isExpanded(node) ? '' : 'rotate(-90deg)'"
                            ></i>
                            {{ forOptionsTreeControl.getViewValue(node) }}
                        </kbq-tree-option>
                    </kbq-tree-selection>
                </kbq-tree-select>
            </kbq-form-field>
        </div>
    `,
    styles: `
        .example-row {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            width: 440px;
            margin: 0 auto;
            padding: var(--kbq-size-l);
            gap: var(--kbq-size-xxl);
        }

        .kbq-form-field {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeSelectDisabledExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    selectedForSelect = 'docs';
    selectedForOptions = 'scripts';

    readonly forSelectTreeControl: FlatTreeControl<FileFlatNode>;
    readonly forSelectDataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;
    readonly forOptionsTreeControl: FlatTreeControl<FileFlatNode>;
    readonly forOptionsDataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.forSelectTreeControl = this.createTreeControl();
        this.forSelectDataSource = this.createDataSource(this.forSelectTreeControl);

        this.forOptionsTreeControl = this.createTreeControl();
        this.forOptionsDataSource = this.createDataSource(this.forOptionsTreeControl);
    }

    protected hasChild(_: number, node: FileFlatNode): boolean {
        return node.expandable;
    }

    private createTreeControl(): FlatTreeControl<FileFlatNode> {
        return new FlatTreeControl<FileFlatNode>(
            this.getLevel,
            this.isExpandable,
            this.getValue,
            this.getViewValue,
            defaultCompareValues,
            defaultCompareViewValues,
            this.isDisabled
        );
    }

    private createDataSource(
        treeControl: FlatTreeControl<FileFlatNode>
    ): KbqTreeFlatDataSource<FileNode, FileFlatNode> {
        const dataSource = new KbqTreeFlatDataSource(
            treeControl,
            new KbqTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren)
        );

        dataSource.data = buildFileTree(DATA_OBJECT, 0);

        return dataSource;
    }

    // The flattener carries the flag onto the flat nodes, and `treeControl.isDisabled` reads it there:
    // a node of a collapsed branch has no rendered option, so only the control's predicate disables it.
    private readonly transformer = (node: FileNode, level: number, parent: any) => {
        const flatNode = new FileFlatNode();

        flatNode.name = node.name;
        flatNode.parent = parent;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children;
        flatNode.disabled = DISABLED_NODE_NAMES.includes(node.name);

        return flatNode;
    };

    private readonly getLevel = (node: FileFlatNode) => node.level;

    private readonly isExpandable = (node: FileFlatNode) => node.expandable;

    private readonly getChildren = (node: FileNode): FileNode[] | undefined => node.children;

    private readonly getValue = (node: FileFlatNode): string => node.name;

    private readonly getViewValue = (node: FileFlatNode): string => `${node.name} view`;

    private readonly isDisabled = (node: FileFlatNode) => node.disabled;
}
