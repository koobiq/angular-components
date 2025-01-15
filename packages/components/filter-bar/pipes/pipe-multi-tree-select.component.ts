import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, ViewEncapsulation } from '@angular/core';
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
import { KbqFilterBar } from '../filter-bar.component';
import { KbqPipeComponent } from '../pipe.component';
import { KbqPipeStates } from './pipe-states.component';

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
    selector: 'kbq-pipe-multi-tree-select',
    templateUrl: 'pipe-multi-tree-select.template.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        FormsModule,
        KbqButtonModule,
        KbqDividerModule,
        KbqIcon,
        KbqTreeModule,
        KbqTreeSelectModule,
        NgClass,
        KbqPipeStates
    ]
})
export class KbqPipeMultiTreeSelectComponent {
    protected readonly filterBar = inject(KbqFilterBar);
    protected readonly basePipe = inject(KbqPipeComponent);
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);

    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: KbqTreeFlattener<FileNode, FileFlatNode>;
    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    get selected() {
        return this.basePipe.data.value;
    }

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
    }

    ngAfterContentInit(): void {
        this.dataSource.data = buildFileTree(this.basePipe.values, 0);
    }

    onDeleteOrClear() {
        if (this.basePipe.data.cleanable) {
            this.basePipe.data.value = undefined;
        } else if (this.basePipe.data.removable) {
            this.basePipe.onDeleteOrClear();
        }

        this.basePipe.stateChanges.next();
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }

    onSelect(item: any) {
        this.basePipe.data.value = item.value;
        this.basePipe.stateChanges.next();
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
