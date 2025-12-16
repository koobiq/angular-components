import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqButtonToggleChange, KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqHighlightModule, PopUpPlacements } from '@koobiq/components/core';
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
import { Subject, debounceTime } from 'rxjs';
import { TreeExamplesModule } from '../../docs-examples/components/tree';
import { DEV_TREE_DATA } from './mock';

export class DevFileNode {
    children: DevFileNode[];
    name: string;
    type: any;
}

/** Flat node with expandable and level information */
export class DevFileFlatNode {
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
export function devBuildFileTree(value: any, level: number): DevFileNode[] {
    const data: any[] = [];

    for (const k of Object.keys(value)) {
        const v = value[k];
        const node = new DevFileNode();

        node.name = `${k}`;

        if (v === null || v === undefined) {
            // no action
        } else if (typeof v === 'object') {
            node.children = devBuildFileTree(v, level + 1);
        } else {
            node.type = v;
        }

        data.push(node);
    }

    return data;
}

export const DEV_DATA_OBJECT = {
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
    selector: 'dev-examples',
    imports: [TreeExamplesModule],
    template: `
        <tree-action-button-example />
        <br />
        <br />
        <tree-toggle-on-click-example />
        <br />
        <br />
        <tree-select-and-mark-example />
        <br />
        <br />
        <tree-selection-separate-from-focus-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [
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
        KbqTitleModule,
        KbqButtonToggleModule,
        JsonPipe,
        DevDocsExamples
    ],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    popUpPlacements = PopUpPlacements;

    treeControl: FlatTreeControl<DevFileFlatNode>;
    treeControl2: FlatTreeControl<DevFileFlatNode>;
    filterByValues: FilterByValues<DevFileFlatNode>;
    treeFlattener: KbqTreeFlattener<DevFileNode, DevFileFlatNode>;

    dataSource: KbqTreeFlatDataSource<any, DevFileFlatNode>;

    filterValue: string = '';
    filterValueChanged = new Subject<string>();

    modelValue: any = ['Pictures'];
    modelValue2: any = ['Pictures'];
    // modelValue: any[] = ['rootNode_1', 'Documents', 'Calendar', 'Chrome'];

    disableState: boolean = false;

    dataSources = {
        small: devBuildFileTree(DEV_DATA_OBJECT, 0),
        big: DEV_TREE_DATA
    };

    readonly treeStates = {
        ALL: 0,
        SELECTED: 1,
        UNSELECTED: 2
    };

    constructor() {
        this.treeFlattener = new KbqTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);

        this.treeControl = new FlatTreeControl<DevFileFlatNode>(
            this.getLevel,
            this.isExpandable,
            this.getValue,
            this.getViewValue
        );

        this.treeControl2 = new FlatTreeControl<DevFileFlatNode>(
            this.getLevel,
            this.isExpandable,
            this.getValue,
            this.getViewValue
        );

        this.filterByValues = new FilterByValues<DevFileFlatNode>(this.treeControl);
        this.filterByValues.setValues(this.modelValue);

        this.treeControl.setFilters(
            new FilterByViewValue<DevFileFlatNode>(this.treeControl),
            this.filterByValues,
            new FilterParentsForNodes<DevFileFlatNode>(this.treeControl)
        );

        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.dataSource.data = this.dataSources.small;

        this.filterValueChanged.pipe(debounceTime(300)).subscribe((value) => this.treeControl.filterNodes(value));
    }

    onModelValueChange(values) {
        this.filterByValues.setValues(values);
    }

    onFilterChange(value): void {
        this.filterValueChanged.next(value);
    }

    hasChild(_: number, nodeData: DevFileFlatNode) {
        return nodeData.expandable;
    }

    onSelectAll($event) {
        console.log('onSelectAll', $event);
    }

    onCopy($event) {
        console.log('onCopy', $event);
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
        if (value === this.treeStates.ALL) {
            this.filterByValues.setValues([]);
        } else if (value === this.treeStates.SELECTED) {
            this.filterByValues.setValues(this.modelValue);
        } else if (value === this.treeStates.UNSELECTED) {
            const values = this.treeControl.dataNodes
                .filter((node) => !this.modelValue.includes(this.treeControl.getValue(node)))
                .map((node) => this.treeControl.getValue(node));

            this.filterByValues.setValues(values);
        }

        this.treeControl.filterNodes(this.filterValue);
    }

    private transformer = (node: DevFileNode, level: number, parent: any) => {
        const flatNode = new DevFileFlatNode();

        flatNode.name = node.name;
        flatNode.parent = parent;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children && !!node.children?.length;

        return flatNode;
    };

    private getLevel = (node: DevFileFlatNode) => {
        return node.level;
    };

    private isExpandable = (node: DevFileFlatNode) => {
        return node.expandable;
    };

    private getChildren = (node: DevFileNode): DevFileNode[] => {
        return node.children;
    };

    private getValue = (node: DevFileFlatNode): string => {
        return node.name;
    };

    private getViewValue = (node: DevFileFlatNode): string => {
        const nodeType = node.type ? `.${node.type}` : '';

        return `${node.name}${nodeType}`;
    };
}
