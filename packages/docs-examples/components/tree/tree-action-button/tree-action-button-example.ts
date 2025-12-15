import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqOptionModule, PopUpPlacements } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import { FlatTreeControl, KbqTreeFlatDataSource, KbqTreeFlattener, KbqTreeModule } from '@koobiq/components/tree';

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
 * @title Tree action button
 */
@Component({
    selector: 'tree-action-button-example',
    imports: [
        KbqTreeModule,
        FormsModule,
        KbqToolTipModule,
        KbqDropdownModule,
        KbqIconModule,
        KbqOptionModule,
        KbqBadgeModule
    ],
    template: `
        <kbq-tree-selection
            style="width: 400px"
            [autoSelect]="false"
            [dataSource]="dataSource"
            [treeControl]="treeControl"
            [(ngModel)]="modelValue"
            (onSelectAll)="onSelectAll($event)"
        >
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding [disabled]="node.name === 'tests'">
                <i kbq-icon="kbq-circle-info_16"></i>

                <div class="layout-row layout-align-space-between">
                    <span [innerHTML]="treeControl.getViewValue(node)"></span>
                    <kbq-badge badgeColor="theme" [compact]="true">badge</kbq-badge>
                </div>

                <kbq-option-action
                    [kbqDropdownTriggerFor]="dropdown"
                    [kbqPlacement]="popUpPlacements.Right"
                    [kbqTooltip]="'Tooltip text'"
                />
            </kbq-tree-option>

            <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                <i kbq-icon="kbq-circle-info_16"></i>

                <kbq-tree-node-toggle [node]="node" />

                <div class="layout-row layout-align-space-between">
                    <span [innerHTML]="treeControl.getViewValue(node)"></span>
                    <kbq-badge badgeColor="theme" [compact]="true">badge</kbq-badge>
                </div>

                <kbq-option-action
                    [kbqDropdownTriggerFor]="dropdown"
                    [kbqPlacement]="popUpPlacements.Right"
                    [kbqTooltip]="'Tooltip text'"
                />
            </kbq-tree-option>
        </kbq-tree-selection>

        <kbq-dropdown #dropdown>
            <button kbq-dropdown-item>action 1</button>
            <button kbq-dropdown-item>action 2</button>
            <button kbq-dropdown-item>action 3</button>
        </kbq-dropdown>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeActionButtonExample {
    popUpPlacements = PopUpPlacements;

    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: KbqTreeFlattener<FileNode, FileFlatNode>;

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    modelValue: any = '';

    constructor() {
        this.treeFlattener = new KbqTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);

        this.treeControl = new FlatTreeControl<FileFlatNode>(
            this.getLevel,
            this.isExpandable,
            this.getValue,
            this.getViewValue
        );
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.dataSource.data = buildFileTree(DATA_OBJECT, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }

    onSelectAll($event) {
        console.log('All items selected', $event);
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
