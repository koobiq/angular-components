import { ChangeDetectionStrategy, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormControl, Validators } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqHighlightModule, KbqPseudoCheckboxModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqTitleModule } from '@koobiq/components/title';
import {
    defaultCompareValues,
    defaultCompareViewValues,
    FlatTreeControl,
    KbqTreeFlatDataSource,
    KbqTreeFlattener,
    KbqTreeModule,
    KbqTreeOption,
    KbqTreeSelection
} from '@koobiq/components/tree';
import {
    KbqTreeSelect,
    KbqTreeSelectChange,
    KbqTreeSelectModule,
    kbqTreeSelectOptionsProvider
} from '@koobiq/components/tree-select';
import { TreeSelectExamplesModule } from '../../docs-examples/components/tree-select';
import { DEV_DATA_OBJECT, devBuildFileTree, DevFileFlatNode, DevFileNode } from '../tree/module';

@Component({
    selector: 'dev-examples',
    imports: [TreeSelectExamplesModule],
    template: `
        <tree-select-custom-matcher-with-input-example />
        <hr />
        <tree-select-with-multiline-matcher-example />
        <hr />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [
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
        DevDocsExamples
    ],
    providers: [
        kbqTreeSelectOptionsProvider({
            // panelWidth: 700
        })
    ],
    templateUrl: './template.html',
    styleUrl: './styles.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp implements OnInit {
    @ViewChild(KbqTreeSelect) select: KbqTreeSelect;
    @ViewChild(KbqTreeSelection) tree: KbqTreeSelection;

    disabledState: boolean = false;

    control = new UntypedFormControl(['rootNode_1', 'Documents', 'November']);

    // modelValue = 'Chrome';
    modelValue: any[] | null = ['Applications', 'Documents', 'Calendar', 'Chrome'];

    treeControl: FlatTreeControl<DevFileFlatNode>;
    treeFlattener: KbqTreeFlattener<DevFileNode, DevFileFlatNode>;

    dataSource: KbqTreeFlatDataSource<DevFileNode, DevFileFlatNode>;

    multiSelectSelectFormControl = new UntypedFormControl([], Validators.pattern(/^w/));

    searchControl: UntypedFormControl = new UntypedFormControl();

    constructor() {
        this.treeFlattener = new KbqTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);

        this.treeControl = new FlatTreeControl<DevFileFlatNode>(
            this.getLevel,
            this.isExpandable,
            this.getValue,
            this.getViewValue,
            defaultCompareValues,
            defaultCompareViewValues,
            this.isDisabled
        );
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.dataSource.data = devBuildFileTree(DEV_DATA_OBJECT, 0);
    }

    ngOnInit(): void {
        this.searchControl.valueChanges.subscribe((value) => this.treeControl.filterNodes(value));
    }

    hasChild(_: number, nodeData: DevFileFlatNode) {
        return nodeData.expandable;
    }

    onSelectionChange($event: KbqTreeSelectChange) {
        if (!$event.value?.length) return;

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

    private transformer = (node: DevFileNode, level: number, parent: any) => {
        const flatNode = new DevFileFlatNode();

        flatNode.name = node.name;
        flatNode.parent = parent;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children;

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
        return `${node.name} view`;
    };

    private isDisabled = (node: DevFileFlatNode): boolean => {
        return node.name === 'November';
    };
}
