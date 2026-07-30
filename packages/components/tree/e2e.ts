import { AfterViewInit, ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqOptionActionComponent, PopUpPlacements } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import {
    defaultCompareValues,
    defaultCompareViewValues,
    FlatTreeControl,
    KbqTreeFlatDataSource,
    KbqTreeFlattener,
    KbqTreeModule
} from '@koobiq/components/tree';

class FileNode {
    children: FileNode[];
    name: string;
    type: any;
}

class FileFlatNode {
    name: string;
    type: any;
    level: number;
    expandable: boolean;
    parent: any;
}

const DATA_OBJECT = {
    rootNode_1_long_text_long_long_long_long_long_text: 'app',
    States: {
        Normal: '',
        Hovered: '',
        Active: '',
        Selected: '',
        SelectedHovered: '',
        SelectedActive: '',
        Focused: '',
        Disabled: ''
    },
    DisabledParent: {
        child: ''
    },
    DisabledToggle: {
        child: ''
    },
    Documents: {
        angular: {
            src: {
                core: {
                    core: {
                        compiler: 'ts'
                    }
                }
            }
        }
    }
};

function buildFileTree(value: any, level: number): FileNode[] {
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

@Component({
    selector: 'e2e-tree-states',
    imports: [
        FormsModule,
        KbqIconModule,
        KbqTreeModule,
        KbqOptionActionComponent,
        KbqToolTipModule
    ],
    template: `
        <kbq-tree-selection
            style="width: 300px"
            class="cdk-keyboard-focused"
            [dataSource]="dataSource"
            [treeControl]="treeControl"
        >
            <kbq-tree-option
                *kbqTreeNodeDef="let node"
                kbqTreeNodePadding
                [class.kbq-hovered]="node.name === 'Hovered' || node.name === 'SelectedHovered'"
                [class.kbq-active]="node.name === 'Active' || node.name === 'SelectedActive'"
                [class.kbq-selected]="
                    node.name === 'Selected' || node.name === 'SelectedHovered' || node.name === 'SelectedActive'
                "
                [class.kbq-focused]="node.name === 'Focused'"
            >
                <span [innerHTML]="treeControl.getViewValue(node)"></span>
            </kbq-tree-option>

            <kbq-tree-option
                *kbqTreeNodeDef="let node; when: hasChild"
                kbqTreeNodePadding
                [checkboxThirdState]="true"
                [disabled]="node.name === 'DisabledParent'"
            >
                <i kbq-icon="kbq-circle-info_16"></i>
                <kbq-tree-node-toggle [node]="node" [disabled]="node.name === 'DisabledToggle'" />
                <span [innerHTML]="treeControl.getViewValue(node)"></span>
            </kbq-tree-option>
        </kbq-tree-selection>

        <br />

        <kbq-tree-selection
            multiple
            class="cdk-keyboard-focused"
            style="width: 300px"
            [dataSource]="dataSource"
            [treeControl]="treeControl"
        >
            <kbq-tree-option
                *kbqTreeNodeDef="let node"
                kbqTreeNodePadding
                [class.kbq-hovered]="node.name === 'Hovered' || node.name === 'SelectedHovered'"
                [class.kbq-active]="node.name === 'Active' || node.name === 'SelectedActive'"
                [class.kbq-selected]="
                    node.name === 'Selected' || node.name === 'SelectedHovered' || node.name === 'SelectedActive'
                "
                [class.kbq-focused]="node.name === 'Focused'"
            >
                <span [innerHTML]="treeControl.getViewValue(node)"></span>

                <kbq-option-action [kbqTooltip]="'Tooltip text'" />
            </kbq-tree-option>

            <kbq-tree-option
                *kbqTreeNodeDef="let node; when: hasChild"
                kbqTreeNodePadding
                [checkboxThirdState]="true"
                [disabled]="node.name === 'DisabledParent'"
            >
                <i kbq-icon="kbq-circle-info_16"></i>
                <kbq-tree-node-toggle [node]="node" [disabled]="node.name === 'DisabledToggle'" />
                <span [innerHTML]="treeControl.getViewValue(node)"></span>
            </kbq-tree-option>
        </kbq-tree-selection>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: row;

            width: 650px;
            gap: 16px;
            padding: 8px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eTreeStates'
    }
})
export class E2eTreeStates implements AfterViewInit {
    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: KbqTreeFlattener<FileNode, FileFlatNode>;

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.treeFlattener = new KbqTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);

        this.treeControl = new FlatTreeControl<FileFlatNode>(
            this.getLevel,
            this.isExpandable,
            this.getValue,
            this.getViewValue,
            defaultCompareValues,
            defaultCompareViewValues,
            this.isDisabled
        );
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.dataSource.data = buildFileTree(DATA_OBJECT, 0);
    }

    ngAfterViewInit(): void {
        this.treeControl.expandAll();
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }

    protected transformer = (node: FileNode, level: number, parent: any) => {
        const flatNode = new FileFlatNode();

        flatNode.name = node.name;
        flatNode.parent = parent;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children;

        return flatNode;
    };

    protected getLevel = (node: FileFlatNode) => {
        return node.level;
    };

    protected isExpandable = (node: FileFlatNode) => {
        return node.expandable;
    };

    protected getChildren = (node: FileNode): FileNode[] => {
        return node.children;
    };

    protected getValue = (node: FileFlatNode): string => {
        return node.name;
    };

    protected getViewValue = (node: FileFlatNode): string => {
        return `${node.name}`;
    };

    protected isDisabled = (node: FileFlatNode): boolean => {
        return node.name === 'Disabled';
    };
    protected readonly popUpPlacements = PopUpPlacements;
}

const DATA_OBJECT_FOR_TREE_TWO_LINE_NODE_EXAMPLE = {
    rootNode_1_long_text_long_long_long_long_long_text: 'app',
    States: {
        Normal: ''
    },
    Documents: {
        angular: {
            src: {
                core: {
                    core: {
                        compiler: 'ts'
                    }
                }
            }
        }
    }
};

const DATA_OBJECT_FOR_TREE_OPTION_ACTION_VISIBILITY = {
    'node-1': 'app',
    'node-2': 'app',
    'node-3': 'app'
};

/**
 * Unlike `E2eTreeStates`, this fixture forces no state classes at all — the option action must be
 * revealed by real hover / real keyboard focus only. See the `kbq-option-action-visibility` mixin.
 */
@Component({
    selector: 'e2e-tree-option-action-visibility',
    imports: [
        KbqTreeModule,
        KbqOptionActionComponent
    ],
    template: `
        <kbq-tree-selection
            data-testid="e2eTree"
            style="width: 300px"
            [dataSource]="dataSource"
            [treeControl]="treeControl"
        >
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding [attr.data-testid]="node.name">
                {{ treeControl.getViewValue(node) }}
                <kbq-option-action />
            </kbq-tree-option>
        </kbq-tree-selection>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eTreeOptionActionVisibility'
    }
})
export class E2eTreeOptionActionVisibility {
    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: KbqTreeFlattener<FileNode, FileFlatNode>;

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.treeFlattener = new KbqTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);

        this.treeControl = new FlatTreeControl<FileFlatNode>(
            this.getLevel,
            this.isExpandable,
            this.getValue,
            this.getViewValue,
            defaultCompareValues,
            defaultCompareViewValues
        );
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.dataSource.data = buildFileTree(DATA_OBJECT_FOR_TREE_OPTION_ACTION_VISIBILITY, 0);
    }

    protected transformer = (node: FileNode, level: number, parent: any) => {
        const flatNode = new FileFlatNode();

        flatNode.name = node.name;
        flatNode.parent = parent;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children;

        return flatNode;
    };

    protected getLevel = (node: FileFlatNode) => node.level;

    protected isExpandable = (node: FileFlatNode) => node.expandable;

    protected getChildren = (node: FileNode): FileNode[] => node.children;

    protected getValue = (node: FileFlatNode): string => node.name;

    protected getViewValue = (node: FileFlatNode): string => node.name;
}

@Component({
    selector: 'e2e-tree-two-line-node',
    imports: [
        FormsModule,
        KbqIconModule,
        KbqTreeModule,
        KbqOptionActionComponent,
        KbqToolTipModule
    ],
    template: `
        <kbq-tree-selection
            style="width: 300px"
            class="cdk-keyboard-focused"
            [dataSource]="dataSource"
            [treeControl]="treeControl"
        >
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                <div>{{ treeControl.getViewValue(node) }}</div>
                <div class="kbq-option-caption">caption</div>
            </kbq-tree-option>

            <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                <kbq-tree-node-toggle [node]="node" />
                <div>{{ treeControl.getViewValue(node) }}</div>
                <div class="kbq-option-caption">caption</div>
            </kbq-tree-option>
        </kbq-tree-selection>

        <br />

        <kbq-tree-selection
            multiple
            class="cdk-keyboard-focused"
            style="width: 300px"
            [dataSource]="dataSource"
            [treeControl]="treeControl"
        >
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                <div>{{ treeControl.getViewValue(node) }}</div>
                <div class="kbq-option-caption">caption</div>

                <kbq-option-action [kbqTooltip]="'Tooltip text'" />
            </kbq-tree-option>

            <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                <kbq-tree-node-toggle [node]="node" />
                <div>{{ treeControl.getViewValue(node) }}</div>
                <div class="kbq-option-caption">caption</div>
            </kbq-tree-option>
        </kbq-tree-selection>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: row;

            width: 650px;
            gap: 16px;
            padding: 8px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eTreeTwoLineNode'
    }
})
export class E2eTreeTwoLineNode implements AfterViewInit {
    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: KbqTreeFlattener<FileNode, FileFlatNode>;

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.treeFlattener = new KbqTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);

        this.treeControl = new FlatTreeControl<FileFlatNode>(
            this.getLevel,
            this.isExpandable,
            this.getValue,
            this.getViewValue,
            defaultCompareValues,
            defaultCompareViewValues,
            this.isDisabled
        );
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.dataSource.data = buildFileTree(DATA_OBJECT_FOR_TREE_TWO_LINE_NODE_EXAMPLE, 0);
    }

    ngAfterViewInit(): void {
        this.treeControl.expandAll();
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }

    protected transformer = (node: FileNode, level: number, parent: any) => {
        const flatNode = new FileFlatNode();

        flatNode.name = node.name;
        flatNode.parent = parent;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children;

        return flatNode;
    };

    protected getLevel = (node: FileFlatNode) => {
        return node.level;
    };

    protected isExpandable = (node: FileFlatNode) => {
        return node.expandable;
    };

    protected getChildren = (node: FileNode): FileNode[] => {
        return node.children;
    };

    protected getValue = (node: FileFlatNode): string => {
        return node.name;
    };

    protected getViewValue = (node: FileFlatNode): string => {
        return `${node.name}`;
    };

    protected isDisabled = (node: FileFlatNode): boolean => {
        return node.name === 'Disabled';
    };
    protected readonly popUpPlacements = PopUpPlacements;
}
