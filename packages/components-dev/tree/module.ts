/* tslint:disable:no-console no-reserved-keywords */
import { Component, NgModule, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqButtonToggleChange, KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqHighlightModule, KbqOptionModule, PopUpPlacements } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTitleModule } from '@koobiq/components/title';
import { KbqToolTipModule } from '@koobiq/components/tooltip';
import {
    FilterByValues,
    FilterByViewValue,
    FilterParentsForNodes,
    FlatTreeControl,
    KbqTreeFlatDataSource,
    KbqTreeFlattener,
    KbqTreeModule
} from '@koobiq/components/tree';
import { debounceTime, Subject } from 'rxjs';

import { TREE_DATA } from './data';


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


@Component({
    selector: 'app',
    templateUrl: './template.html',
    styleUrls: ['../main.scss', './styles.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DemoComponent {
    // tslint:disable-next-line:naming-convention
    PopUpPlacements = PopUpPlacements;

    treeControl: FlatTreeControl<FileFlatNode>;
    treeControl2: FlatTreeControl<FileFlatNode>;
    filterByValues:  FilterByValues<FileFlatNode>;
    treeFlattener: KbqTreeFlattener<FileNode, FileFlatNode>;

    dataSource: KbqTreeFlatDataSource<any, FileFlatNode>;

    filterValue: string = '';
    filterValueChanged = new Subject<string>();

    modelValue: any = ['Pictures'];
    modelValue2: any = ['Pictures'];
    // modelValue: any[] = ['rootNode_1', 'Documents', 'Calendar', 'Chrome'];

    disableState: boolean = false;

    dataSources = {
        small: buildFileTree(DATA_OBJECT, 0),
        big: TREE_DATA
    };

    readonly TreeStates = {
        ALL: 0,
        SELECTED: 1,
        UNSELECTED: 2
    };

    constructor() {
        this.treeFlattener = new KbqTreeFlattener(
            this.transformer, this.getLevel, this.isExpandable, this.getChildren
        );

        this.treeControl = new FlatTreeControl<FileFlatNode>(
            this.getLevel, this.isExpandable, this.getValue, this.getViewValue
        );

        this.treeControl2 = new FlatTreeControl<FileFlatNode>(
            this.getLevel, this.isExpandable, this.getValue, this.getViewValue
        );

        this.filterByValues = new FilterByValues<FileFlatNode>(this.treeControl);
        this.filterByValues.setValues(this.modelValue);

        this.treeControl.setFilters(
            new FilterByViewValue<FileFlatNode>(this.treeControl),
            this.filterByValues,
            new FilterParentsForNodes<FileFlatNode>(this.treeControl)
        );

        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.dataSource.data = this.dataSources.small;

        this.filterValueChanged
            // tslint:disable-next-line:no-magic-numbers
            .pipe(debounceTime(300))
            .subscribe((value) => this.treeControl.filterNodes(value));
    }

    onModelValueChange(values) {
        this.filterByValues.setValues(values);
    }

    onFilterChange(value): void {
        this.filterValueChanged.next(value);
    }

    hasChild(_: number, nodeData: FileFlatNode) { return nodeData.expandable; }

    onSelectAll($event) {
        console.log('onSelectAll', $event);
    }

    onNavigationChange($event) {
        console.log('onNavigationChange', $event);
    }

    onSelectionChange($event) {
        console.log('onSelectionChange', $event);
    }

    switchToDataSource(dataSourceType: 'small' | 'big') {
        this.dataSource.data = this.dataSources[dataSourceType];
    }

    onToggleClick({ value }: KbqButtonToggleChange) {
        if (value === this.TreeStates.ALL) {
            this.filterByValues.setValues([]);
        } else if (value === this.TreeStates.SELECTED) {
            this.filterByValues.setValues(this.modelValue);
        } else if (value === this.TreeStates.UNSELECTED) {
            const values = this.treeControl.dataNodes
                .filter((node) => !this.modelValue.includes(this.treeControl.getValue(node)))
                .map((node) => this.treeControl.getValue(node));
            this.filterByValues.setValues(values);
        }

        this.treeControl.filterNodes(this.filterValue);
    }

    private transformer = (node: FileNode, level: number, parent: any) => {
        const flatNode = new FileFlatNode();

        flatNode.name = node.name;
        flatNode.parent = parent;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children && !!node.children?.length;

        return flatNode;
    }

    private getLevel = (node: FileFlatNode) => {
        return node.level;
    }

    private isExpandable = (node: FileFlatNode) => {
        return node.expandable;
    }

    private getChildren = (node: FileNode): FileNode[] => {
        return node.children;
    }

    private getValue = (node: FileFlatNode): string => {
        return node.name;
    }

    private getViewValue = (node: FileFlatNode): string => {
        const nodeType = node.type ? `.${node.type}` : '';

        return `${node.name}${nodeType}`;
    }
}


@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        KbqFormFieldModule,
        KbqCheckboxModule,
        KbqDropdownModule,
        KbqInputModule,
        KbqButtonModule,
        KbqTreeModule,
        KbqIconModule,
        KbqToolTipModule,
        KbqHighlightModule,
        KbqOptionModule,
        KbqTitleModule,
        KbqButtonToggleModule
    ],
    bootstrap: [DemoComponent]
})
export class DemoModule {}
