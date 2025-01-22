import { NgClass } from '@angular/common';
import { AfterContentInit, ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqIcon } from '@koobiq/components/icon';
import {
    defaultCompareValues,
    defaultCompareViewValues,
    FlatTreeControl,
    KbqTreeFlatDataSource,
    KbqTreeFlattener,
    KbqTreeModule
} from '@koobiq/components/tree';
import { KbqTreeSelectModule } from '@koobiq/components/tree-select';
import { KbqBasePipe } from './base-pipe';
import { KbqPipeButton } from './pipe-button';
import { KbqPipeState } from './pipe-state';

class FileNode {
    children: FileNode[];
    name: string;
    type: any;
}

/** Flat node with expandable and level information */
class FileFlatNode {
    name: string;
    type: any;
    level: number;
    expandable: boolean;
    parent: any;
}

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
    standalone: true,
    selector: 'kbq-pipe-tree-multiselect',
    templateUrl: 'pipe-tree-multiselect.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['base-pipe.scss', 'pipe-tree-multiselect.scss'],
    providers: [
        {
            provide: KbqBasePipe,
            useExisting: this
        }
    ],
    imports: [
        FormsModule,
        KbqButtonModule,
        KbqDividerModule,
        KbqIcon,
        KbqTreeModule,
        KbqTreeSelectModule,
        NgClass,
        KbqPipeState,
        KbqPipeButton
    ]
})
export class KbqPipeMultiTreeSelectComponent extends KbqBasePipe implements AfterContentInit {
    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: KbqTreeFlattener<FileNode, FileFlatNode>;
    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    get selected() {
        return this.data.value;
    }

    get isEmpty(): boolean {
        return !!this.data.value;
    }

    constructor() {
        super();

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
    }

    ngAfterContentInit(): void {
        this.dataSource.data = buildFileTree(this.values, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }

    onSelect(item: any) {
        this.data.value = item.value;
        this.stateChanges.next();
    }

    compareByValue = (o1: any, o2: any): boolean => o1 && o2 && o1.value === o2.value;

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
        return `${node.name}`;
    };
}
