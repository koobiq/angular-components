import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqIconModule } from '@koobiq/components/icon';
import { FlatTreeControl, KbqTreeFlatDataSource, KbqTreeFlattener, KbqTreeModule } from '@koobiq/components/tree';
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
 * @title Tree-select locale configuration
 */
@Component({
    selector: 'tree-select-locale-configuration-example',
    imports: [FormsModule, KbqTreeModule, KbqTreeSelectModule, KbqIconModule],
    template: `
        <kbq-form-field>
            <kbq-label>{{ t().defaultStrings }}</kbq-label>
            <kbq-tree-select multiple selectAll [placeholder]="t().placeholder" [(ngModel)]="defaultSelected">
                <kbq-tree-selection [dataSource]="defaultDataSource" [treeControl]="defaultTreeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                        {{ defaultTreeControl.getViewValue(node) }}
                    </kbq-tree-option>

                    <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                        <i
                            kbq-icon="kbq-chevron-down-s_16"
                            kbqTreeNodeToggle
                            [style.transform]="defaultTreeControl.isExpanded(node) ? '' : 'rotate(-90deg)'"
                        ></i>
                        {{ defaultTreeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-label>{{ t().overriddenInstance }}</kbq-label>
            <!-- Keyed by locale section, so one binding also reaches the accessible name of the cleaner
                 projected into the select. Every string it does not mention keeps following the locale. -->
            <kbq-tree-select
                multiple
                selectAll
                [placeholder]="t().placeholder"
                [localeOverrides]="{
                    select: { selectAll: 'Take everything' },
                    a11y: { clear: 'Drop the selection' }
                }"
                [(ngModel)]="overriddenSelected"
            >
                <kbq-cleaner />
                <kbq-tree-selection [dataSource]="overriddenDataSource" [treeControl]="overriddenTreeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                        {{ overriddenTreeControl.getViewValue(node) }}
                    </kbq-tree-option>

                    <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                        <i
                            kbq-icon="kbq-chevron-down-s_16"
                            kbqTreeNodeToggle
                            [style.transform]="overriddenTreeControl.isExpanded(node) ? '' : 'rotate(-90deg)'"
                        ></i>
                        {{ overriddenTreeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-l);
            padding: var(--kbq-size-l);
        }

        .kbq-form-field-type-select {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeSelectLocaleConfigurationExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    defaultSelected = ['docs'];
    overriddenSelected = ['docs'];

    readonly defaultTreeControl: FlatTreeControl<FileFlatNode>;
    readonly defaultDataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;
    readonly overriddenTreeControl: FlatTreeControl<FileFlatNode>;
    readonly overriddenDataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.defaultTreeControl = this.createTreeControl();
        this.defaultDataSource = this.createDataSource(this.defaultTreeControl, buildFileTree(DATA_OBJECT, 0));

        this.overriddenTreeControl = this.createTreeControl();
        this.overriddenDataSource = this.createDataSource(this.overriddenTreeControl, buildFileTree(DATA_OBJECT, 0));
    }

    protected hasChild(_: number, node: FileFlatNode): boolean {
        return node.expandable;
    }

    private createTreeControl(): FlatTreeControl<FileFlatNode> {
        return new FlatTreeControl<FileFlatNode>(this.getLevel, this.isExpandable, this.getValue, this.getViewValue);
    }

    private createDataSource(
        treeControl: FlatTreeControl<FileFlatNode>,
        data: FileNode[]
    ): KbqTreeFlatDataSource<FileNode, FileFlatNode> {
        const dataSource = new KbqTreeFlatDataSource(
            treeControl,
            new KbqTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren)
        );

        dataSource.data = data;

        return dataSource;
    }

    private readonly transformer = (node: FileNode, level: number, parent: any) => {
        const flatNode = new FileFlatNode();

        flatNode.name = node.name;
        flatNode.parent = parent;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children;

        return flatNode;
    };

    private readonly getLevel = (node: FileFlatNode) => node.level;

    private readonly isExpandable = (node: FileFlatNode) => node.expandable;

    private readonly getChildren = (node: FileNode): FileNode[] | undefined => node.children;

    private readonly getValue = (node: FileFlatNode): string => node.name;

    private readonly getViewValue = (node: FileFlatNode): string => `${node.name} view`;
}
