/* tslint:disable:no-reserved-keywords object-literal-key-quotes */
import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { FlatTreeControl, KbqTreeFlatDataSource, KbqTreeFlattener, KbqTreeSelection } from '@koobiq/components/tree';
import { Subscription } from 'rxjs';

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

const allDescendantsSelected = <T>(descendants: T[], selectionList: any) => {
    return descendants.every((descendant) => selectionList.includes(descendant));
};

const recursiveDeselect = (node: any, control: FlatTreeControl<any>) => {
    const descendants: any[] = control.getDescendants(node);
    const descendantsForDeselection: any[] = [];
    for (const descendant of descendants) {
        if (descendant.disabled && descendant.level === node.level + 1) {
            descendantsForDeselection.push(descendant);
            if (descendant.expandable) {
                descendantsForDeselection.push(...recursiveDeselect(descendant, control));
            }
            descendantsForDeselection.push(descendant);
        }
    }
    return descendantsForDeselection;
};

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
    docs: 'app',
    src: {
        cdk: {
            a11ly: {
                'aria describer': {
                    'aria-describer': 'ts',
                    'aria-describer.spec': 'ts',
                    'aria-reference': 'ts',
                    'aria-reference.spec': 'ts',
                },
                'focus monitor': {
                    'focus-monitor': 'ts',
                    'focus-monitor.spec': 'ts',
                },
            },
        },
        documentation: {
            source: '',
            tools: '',
        },
        koobiq: {
            autocomplete: '',
            button: '',
            'button-toggle': '',
            index: 'ts',
            package: 'json',
            version: 'ts',
        },
        'koobiq-dev': {
            alert: '',
            badge: '',
        },
        'koobiq-examples': '',
        'koobiq-moment-adapter': '',
        README: 'md',
        'tsconfig.build': 'json',
        wallabyTest: 'ts',
    },
    scripts: {
        deploy: {
            'cleanup-preview': 'ts',
            'publish-artifacts': 'sh',
            'publish-docs': 'sh',
            'publish-docs-preview': 'ts',
        },
        'tsconfig.deploy': 'json',
    },
    tests: '',
};

abstract class TreeParams {
    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: KbqTreeFlattener<FileNode, FileFlatNode>;
    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;
    treeData: FileNode[];

    constructor() {
        this.treeControl = new FlatTreeControl(
            this.getLevel,
            this.isExpandable,
            this.getValue,
            this.getViewValue,
            undefined,
            undefined,
            this.isDisabled,
        );
        this.treeFlattener = new KbqTreeFlattener<FileNode, FileFlatNode>(
            this.transformer,
            this.getLevel,
            this.isExpandable,
            this.getChildren,
        );
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);
        this.dataSource.data = this.treeData = buildFileTree(DATA_OBJECT, 0);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }

    getLevel = (node: FileFlatNode) => node.level;

    getValue = (node: FileFlatNode) => node.name;

    getViewValue = (node: FileFlatNode): string => {
        const nodeType = node.type ? `.${node.type}` : '';

        return `${node.name}${nodeType}`;
    };

    isDisabled = (node: any): boolean => {
        return node.disabled;
    };

    isExpandable = (node: FileFlatNode) => node.expandable;

    getChildren = (node: FileNode) => node.children;

    transformer = (node: FileNode, level: number, parent: any) => {
        const flatNode = new FileFlatNode();

        flatNode.name = node.name;
        flatNode.parent = parent;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children?.length;

        return flatNode;
    };
}

/**
 * @title Tree Descendants Subcategories
 */
@Component({
    selector: 'tree-access-rights-example',
    templateUrl: 'tree-access-rights-example.html',
    styleUrls: ['tree-access-rights-example.css'],
})
export class TreeAccessRightsExample extends TreeParams implements AfterViewInit, OnDestroy {
    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: KbqTreeFlattener<FileNode, FileFlatNode>;

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    modelValue: any = [];
    filteredModel: any = [];

    selectionChangeSubscription: Subscription = Subscription.EMPTY;

    @ViewChild(KbqTreeSelection) tree: KbqTreeSelection;

    constructor() {
        super();
    }

    ngAfterViewInit(): void {
        const handleSingleOption = (items, cb) => {
            // Process only when a single item is selected
            if (items.length === 1) {
                const singleOrParent: any = items[0];
                cb(singleOrParent);
            }
        };

        this.selectionChangeSubscription = this.tree.selectionModel.changed.subscribe(({ added, removed }) => {
            handleSingleOption(added, (singleItemOrParent: any) => {
                if (singleItemOrParent.expandable) {
                    const descendants = this.treeControl.getDescendants(singleItemOrParent);
                    if (!allDescendantsSelected(descendants, this.tree.selectionModel.selected)) {
                        descendants.forEach((descendant) => {
                            const previouslySelected = (descendant as any)?.singleSelected;
                            if (!previouslySelected) {
                                (descendant as any).disabled = true;
                            }
                        });
                        setTimeout(() => this.tree.selectionModel.select(...(descendants as any[])));
                    }
                }

                // check after descendants selected with parent selection
                setTimeout(() => {
                    if (!singleItemOrParent.disabled) {
                        singleItemOrParent.singleSelected = true;
                    }
                });
            });

            handleSingleOption(removed, (singleItemOrParent: any) => {
                const parents = this.treeControl.getParents(singleItemOrParent, []);

                const descendantsForDeselection: any[] = recursiveDeselect(singleItemOrParent, this.treeControl);
                if (descendantsForDeselection.length) {
                    this.tree.selectionModel.deselect(...descendantsForDeselection);
                    descendantsForDeselection.forEach((descendant) => (descendant.disabled = undefined));
                }

                // set disabled if any parent selected
                if (
                    singleItemOrParent.singleSelected &&
                    parents.some((parent: any) => this.tree.selectionModel.selected.includes(parent))
                ) {
                    singleItemOrParent.disabled = true;
                    // Delay selection for the next loop after parent deselection
                    setTimeout(() => {
                        this.tree.selectionModel.select(singleItemOrParent);
                    }, 0);
                }

                // unselect in any case
                setTimeout(() => {
                    singleItemOrParent.singleSelected = undefined;
                }, 0);
            });
        });
    }

    ngOnDestroy(): void {
        this.selectionChangeSubscription.unsubscribe();
    }

    onModelChange($event) {
        this.modelValue = $event;
        this.filteredModel = this.tree.selectionModel.selected
            .filter((option: any) => !option.disabled)
            .map((node: any) => this.treeControl.getValue(node));
    }
}
