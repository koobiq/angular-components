import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import {
    defaultCompareValues,
    defaultCompareViewValues,
    FlatTreeControl,
    KbqTreeFlatDataSource,
    KbqTreeFlattener,
    KbqTreeModule
} from '@koobiq/components/tree';
import { KbqTreeSelectModule } from './tree-select.module';

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
    rootNode_1_long_text_long_text: 'app',
    Pictures: {
        Sun: 'png',
        Woods: 'jpg',
        PhotoBoothLibrary: {
            Contents: 'dir',
            Pictures_2: 'dir'
        }
    },
    Documents: {
        angular: {
            src: {
                core: 'ts',
                compiler: 'ts'
            }
        },
        material2: {
            src: {
                button: 'ts',
                checkbox: 'ts',
                input: 'ts'
            }
        },
        Pictures_3: 'Pictures'
    },
    Downloads: {
        Tutorial: 'html',
        November: 'pdf',
        October: 'pdf'
    },
    Applications: {
        Chrome: 'app',
        Calendar: 'app',
        Webstorm: 'app'
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

class BaseTreeSelectStates {
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
        return `${node.name} view`;
    };

    protected isDisabled = (node: FileFlatNode): boolean => {
        return node.name === 'November';
    };
}

@Component({
    selector: 'e2e-tree-select-states',
    imports: [
        FormsModule,
        KbqIconModule,
        KbqInputModule,
        KbqTreeModule,
        KbqTreeSelectModule
    ],
    template: `
        <kbq-form-field style="width: 250px;">
            <kbq-tree-select
                data-testid="e2eTreeSelect"
                placeholder="this is placeholder"
                [ngModel]="'rootNode_1_long_text_long_text'"
            >
                <kbq-form-field kbqFormFieldWithoutBorders kbqSelectSearch>
                    <i kbq-icon="kbq-magnifying-glass_16" kbqPrefix></i>
                    <input kbqInput type="text" [ngModel]="''" />
                    <kbq-cleaner />
                </kbq-form-field>

                <div kbq-select-search-empty-result>Nothing found</div>

                <kbq-cleaner #kbqSelectCleaner />

                <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                        <span [innerHTML]="treeControl.getViewValue(node)"></span>
                    </kbq-tree-option>

                    <kbq-tree-option
                        *kbqTreeNodeDef="let node; when: hasChild"
                        kbqTreeNodePadding
                        [checkboxThirdState]="true"
                    >
                        <kbq-tree-node-toggle [node]="node" />
                        <span [innerHTML]="treeControl.getViewValue(node)"></span>
                    </kbq-tree-option>
                </kbq-tree-selection>

                <kbq-select-footer>Caption ⌥+⌘+F</kbq-select-footer>
            </kbq-tree-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: row;

            width: 320px;
            height: 300px;
            gap: 16px;
            padding: 8px;
        }
    `,
    host: {
        'data-testid': 'e2eTreeSelectStates'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class E2eTreeSelectStates extends BaseTreeSelectStates {}

@Component({
    selector: 'e2e-multi-tree-select-states',
    imports: [
        FormsModule,
        KbqIconModule,
        KbqInputModule,
        KbqTreeModule,
        KbqTreeSelectModule
    ],
    template: `
        <kbq-form-field style="width: 250px;">
            <kbq-tree-select
                data-testid="e2eMultiTreeSelect"
                placeholder="this is placeholder"
                [multiple]="true"
                [ngModel]="['rootNode_1_long_text_long_text', 'material2', 'PhotoBoothLibrary']"
            >
                <kbq-form-field kbqFormFieldWithoutBorders kbqSelectSearch>
                    <i kbq-icon="kbq-magnifying-glass_16" kbqPrefix></i>
                    <input kbqInput type="text" [ngModel]="''" />
                    <kbq-cleaner />
                </kbq-form-field>

                <div kbq-select-search-empty-result>Nothing found</div>

                <kbq-cleaner #kbqSelectCleaner />

                <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                        <span [innerHTML]="treeControl.getViewValue(node)"></span>
                    </kbq-tree-option>

                    <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                        <kbq-tree-node-toggle [node]="node" />
                        <span [innerHTML]="treeControl.getViewValue(node)"></span>
                    </kbq-tree-option>
                </kbq-tree-selection>

                <kbq-select-footer>Caption ⌥+⌘+F</kbq-select-footer>
            </kbq-tree-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: row;

            width: 320px;
            height: 300px;
            gap: 16px;
            padding: 8px;
        }
    `,
    host: {
        'data-testid': 'e2eMultiTreeSelectStates'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class E2eMultiTreeSelectStates extends BaseTreeSelectStates {}

@Component({
    selector: 'e2e-multiline-tree-select-states',
    imports: [
        FormsModule,
        KbqIconModule,
        KbqInputModule,
        KbqTreeModule,
        KbqTreeSelectModule
    ],
    template: `
        <kbq-form-field style="width: 250px;">
            <kbq-tree-select
                data-testid="e2eMultilineTreeSelect"
                placeholder="this is placeholder"
                [multiple]="true"
                [multiline]="true"
                [ngModel]="['rootNode_1_long_text_long_text', 'material2', 'PhotoBoothLibrary']"
            >
                <kbq-form-field kbqFormFieldWithoutBorders kbqSelectSearch>
                    <i kbq-icon="kbq-magnifying-glass_16" kbqPrefix></i>
                    <input kbqInput type="text" [ngModel]="''" />
                    <kbq-cleaner />
                </kbq-form-field>

                <div kbq-select-search-empty-result>Nothing found</div>

                <kbq-cleaner #kbqSelectCleaner />

                <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                        <span [innerHTML]="treeControl.getViewValue(node)"></span>
                    </kbq-tree-option>

                    <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                        <kbq-tree-node-toggle [node]="node" />
                        <span [innerHTML]="treeControl.getViewValue(node)"></span>
                    </kbq-tree-option>
                </kbq-tree-selection>

                <kbq-select-footer>Caption ⌥+⌘+F</kbq-select-footer>
            </kbq-tree-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: row;

            width: 320px;
            height: 350px;
            gap: 16px;
            padding: 8px;
        }
    `,
    host: {
        'data-testid': 'e2eMultilineTreeSelectStates'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class E2eMultilineTreeSelectStates extends BaseTreeSelectStates {}
