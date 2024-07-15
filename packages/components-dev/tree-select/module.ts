/* tslint:disable:no-console no-reserved-keywords */
import { Component, NgModule, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, Validators } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqHighlightModule, KbqPseudoCheckboxModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqTitleModule } from '@koobiq/components/title';
import {
    FlatTreeControl,
    KbqTreeFlatDataSource,
    KbqTreeFlattener,
    KbqTreeModule,
    KbqTreeOption,
    KbqTreeSelection,
    defaultCompareValues,
    defaultCompareViewValues,
} from '@koobiq/components/tree';
import { KbqTreeSelect, KbqTreeSelectChange, KbqTreeSelectModule } from '@koobiq/components/tree-select';

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
    rootNode_1: 'app',
    Pictures: {
        Sun: 'png',
        Woods: 'jpg',
        PhotoBoothLibrary: {
            Contents: 'dir',
            Pictures_2: 'dir',
        },
    },
    Documents: {
        Pictures_3: 'Pictures',
        angular: {
            src1: {
                core: 'ts',
                compiler: 'ts',
            },
        },
        material2: {
            src2: {
                button: 'ts',
                checkbox: 'ts',
                input: 'ts',
            },
        },
    },
    Downloads: {
        Tutorial: 'html',
        November: 'pdf',
        October: 'pdf',
    },
    Applications: {
        Chrome: 'app',
        Calendar: 'app',
        Webstorm: 'app',
    },
    rootNode_1_long_text_long_long_text_long_long_text_long_long_text_long_text_: 'app',
};

@Component({
    selector: 'app',
    templateUrl: 'template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class DemoComponent implements OnInit {
    @ViewChild(KbqTreeSelect) select: KbqTreeSelect;
    @ViewChild(KbqTreeSelection) tree: KbqTreeSelection;

    disabledState: boolean = false;

    control = new UntypedFormControl(['rootNode_1', 'Documents', 'November']);

    // modelValue = 'Chrome';
    modelValue: any[] | null = ['Applications', 'Documents', 'Calendar', 'Chrome'];

    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: KbqTreeFlattener<FileNode, FileFlatNode>;

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    multiSelectSelectFormControl = new UntypedFormControl([], Validators.pattern(/^w/));

    searchControl: UntypedFormControl = new UntypedFormControl();

    constructor() {
        this.treeFlattener = new KbqTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);

        this.treeControl = new FlatTreeControl<FileFlatNode>(
            this.getLevel,
            this.isExpandable,
            this.getValue,
            this.getViewValue,
            defaultCompareValues,
            defaultCompareViewValues,
            this.isDisabled,
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

    onSelectionChange($event: KbqTreeSelectChange) {
        const option: KbqTreeOption = $event.value;
        console.log(`onSelectionChange: ${$event.value}`);

        if (option.isExpandable) {
            this.tree.setStateChildren(option, !option.selected);
        }

        this.toggleParents($event.value.data.parent);
    }

    hiddenItemsTextFormatter(hiddenItemsText: string, hiddenItems: number): string {
        return `${hiddenItemsText} ${hiddenItems}`;
    }

    openedChange($event) {
        console.log('openedChange: ', $event);
    }

    opened($event) {
        console.log('opened: ', $event);
    }

    closed($event) {
        console.log('closed: ', $event);
    }

    private toggleParents(parent) {
        if (!parent) {
            return;
        }

        const descendants = this.treeControl.getDescendants(parent);
        const isParentSelected = this.select.selectionModel.selected.includes(parent);

        if (!isParentSelected && descendants.every((d: any) => this.select.selectionModel.selected.includes(d))) {
            this.select.selectionModel.select(parent);
            this.toggleParents(parent.parent);
        } else if (isParentSelected) {
            this.select.selectionModel.deselect(parent);
            this.toggleParents(parent.parent);
        }
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
        return `${node.name} view`;
    };

    private isDisabled = (node: FileFlatNode): boolean => {
        return node.name === 'November';
    };
}

@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        KbqTreeModule,
        KbqTreeSelectModule,
        KbqSelectModule,
        KbqHighlightModule,

        KbqButtonModule,
        KbqInputModule,
        KbqFormFieldModule,
        KbqIconModule,
        ReactiveFormsModule,
        KbqPseudoCheckboxModule,
        KbqTitleModule,
    ],
    bootstrap: [DemoComponent],
})
export class DemoModule {}
