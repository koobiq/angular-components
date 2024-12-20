import { NgClass } from '@angular/common';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
    ViewEncapsulation
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqIcon } from '../../icon';
import {
    defaultCompareValues,
    defaultCompareViewValues,
    FlatTreeControl,
    KbqTreeFlatDataSource,
    KbqTreeFlattener,
    KbqTreeModule
} from '../../tree';
import { KbqTreeSelectModule } from '../../tree-select';
import { KbqFilterBar } from '../filter-bar.component';
import { KbqPipeStates } from './pipe-states.component';
import { KbqPipeBase } from './pipe.component';

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
    selector: 'kbq-pipe[tree-select]',
    template: `
        <kbq-tree-select
            #select
            [ngModel]="selected"
            [disabled]="data.disabled"
            [compareWith]="compareByValue"
            (selectionChange)="onSelect($event.value)"
        >
            <button
                [ngClass]="{ 'kbq-active': select.panelOpen }"
                [disabled]="data.disabled"
                [kbq-pipe-states]="data"
                kbq-button
                kbq-select-matcher
            >
                <span class="kbq-pipe__name">{{ data.name }}</span>
                <span class="kbq-pipe__value">{{ select.triggerValue }}</span>
            </button>

            <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                    <span [innerHTML]="treeControl.getViewValue(node)"></span>
                </kbq-tree-option>

                <kbq-tree-option
                    *kbqTreeNodeDef="let node; when: hasChild"
                    kbqTreeNodePadding
                >
                    <kbq-tree-node-toggle [node]="node" />
                    <span [innerHTML]="treeControl.getViewValue(node)"></span>
                </kbq-tree-option>
            </kbq-tree-selection>
        </kbq-tree-select>

        @if (!data.required && !isEmpty) {
            <button
                class="kbq-pipe__delete"
                [disabled]="data.disabled"
                [kbq-pipe-states]="data"
                (click)="onDeleteOrClear()"
                kbq-button
            >
                <i kbq-icon="kbq-xmark-s_16"></i>
            </button>
        }
    `,
    styleUrls: ['pipe.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-pipe kbq-pipe_tree-select',
        '[class.kbq-pipe_empty]': 'isEmpty',
        '[class.kbq-pipe_readonly]': 'data.required',
        '[class.kbq-pipe_disabled]': 'data.disabled'
    },
    providers: [
        {
            provide: KbqPipeBase,
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
        KbqPipeStates
    ]
})
export class KbqPipeTreeSelectComponent extends KbqPipeBase implements AfterContentInit {
    protected readonly filterBar = inject(KbqFilterBar);
    protected readonly changeDetectorRef = inject(ChangeDetectorRef);

    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: KbqTreeFlattener<FileNode, FileFlatNode>;
    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    get isEmpty(): boolean {
        return this.data.value === undefined;
    }

    get selected() {
        return this.data.value;
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
        super.ngAfterContentInit();

        this.dataSource.data = buildFileTree(this.values, 0);
    }

    override onDeleteOrClear() {
        if (this.data.cleanable) {
            this.data.value = undefined;
        } else if (this.data.removable) {
            super.onDeleteOrClear();
        }

        this.stateChanges.next();
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
