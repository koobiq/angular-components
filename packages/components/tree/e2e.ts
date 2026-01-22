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
        Focused: '',
        Disabled: ''
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
                [class.kbq-active]="node.name === 'Active'"
                [class.kbq-selected]="node.name === 'Selected' || node.name === 'SelectedHovered'"
                [class.kbq-focused]="node.name === 'Focused'"
            >
                <span [innerHTML]="treeControl.getViewValue(node)"></span>
            </kbq-tree-option>

            <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding [checkboxThirdState]="true">
                <kbq-tree-node-toggle [node]="node" />
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
                [class.kbq-active]="node.name === 'Active'"
                [class.kbq-selected]="node.name === 'Selected' || node.name === 'SelectedHovered'"
                [class.kbq-focused]="node.name === 'Focused'"
            >
                <span [innerHTML]="treeControl.getViewValue(node)"></span>

                <kbq-option-action [kbqTooltip]="'Tooltip text'" />
            </kbq-tree-option>

            <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding [checkboxThirdState]="true">
                <kbq-tree-node-toggle [node]="node" />
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
    host: {
        'data-testid': 'e2eTreeStates'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
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
