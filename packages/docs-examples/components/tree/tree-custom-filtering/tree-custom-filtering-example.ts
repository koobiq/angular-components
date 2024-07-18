/* tslint:disable:no-reserved-keywords object-literal-key-quotes */
import { Component } from '@angular/core';
import {
    FlatTreeControl,
    FlatTreeControlFilter,
    KbqTreeFlatDataSource,
    KbqTreeFlattener
} from '@koobiq/components/tree';

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
    docs: 'app',
    src: {
        cdk: {
            a11ly: {
                'aria describer': {
                    'aria-describer': 'ts',
                    'aria-describer.spec': 'ts',
                    'aria-reference': 'ts',
                    'aria-reference.spec': 'ts'
                },
                'focus monitor': {
                    'focus-monitor': 'ts',
                    'focus-monitor.spec': 'ts'
                }
            }
        },
        documentation: {
            source: '',
            tools: ''
        },
        mosaic: {
            autocomplete: '',
            button: '',
            'button-toggle': '',
            index: 'ts',
            package: 'json',
            version: 'ts'
        },
        'mosaic-dev': {
            alert: '',
            badge: ''
        },
        'mosaic-examples': '',
        'mosaic-moment-adapter': '',
        README: 'md',
        'tsconfig.build': 'json'
    },
    scripts: {
        deploy: {
            'cleanup-preview': 'ts',
            'publish-artifacts': 'sh',
            'publish-docs': 'sh',
            'publish-docs-preview': 'ts'
        },
        'tsconfig.deploy': 'json'
    },
    tests: ''
};

function hasFilteredDescendant<T>(dataNode: T, filteredNodes: T[], control: FlatTreeControl<T>) {
    const filteredViewValues = filteredNodes.map((node: any) => control.getViewValue(node));

    return (
        control.getDescendants(dataNode).filter((node) => filteredViewValues.includes(control.getViewValue(node)))
            .length > 0
    );
}

export class CustomTreeControlFilter<T> implements FlatTreeControlFilter<T> {
    result: T[];

    constructor(private control: FlatTreeControl<T>) {}

    handle(value: string | null): T[] {
        const result: Set<T> = new Set();

        const foundedNodes = this.control.dataNodes.filter((node: any) => {
            return this.control.compareViewValues(this.control.getViewValue(node), value);
        });

        foundedNodes.forEach((filteredNode) => {
            this.control.getParents(filteredNode, []).forEach((node) => result.add(node));

            result.add(filteredNode);

            if (this.control.isExpandable(filteredNode)) {
                const childNodeLevel = this.control.getLevel(filteredNode) + 1;

                this.control.getDescendants(filteredNode).forEach((childNode) => {
                    if (
                        this.control.getLevel(childNode) === childNodeLevel &&
                        (!this.control.isExpandable(childNode) ||
                            !hasFilteredDescendant<T>(childNode, foundedNodes, this.control))
                    ) {
                        result.add(childNode);
                    }
                });
            }
        });

        this.result = Array.from(result);

        return this.result;
    }
}

/**
 * @title Basic tree
 */
@Component({
    selector: 'tree-custom-filtering-example',
    templateUrl: 'tree-custom-filtering-example.html',
    styleUrls: ['tree-custom-filtering-example.css']
})
export class TreeCustomFilteringExample {
    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: KbqTreeFlattener<FileNode, FileFlatNode>;

    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    modelValue: any = '';
    filterValue: string = '';

    constructor() {
        this.treeFlattener = new KbqTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);

        this.treeControl = new FlatTreeControl<FileFlatNode>(
            this.getLevel,
            this.isExpandable,
            this.getValue,
            this.getViewValue
        );
        this.treeControl.setFilters(new CustomTreeControlFilter<FileFlatNode>(this.treeControl));

        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.dataSource.data = buildFileTree(DATA_OBJECT, 0);
    }

    onFilterChange(value: string): void {
        this.treeControl.filterNodes(value);
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
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
        const nodeType = node.type ? `.${node.type}` : '';

        return `${node.name}${nodeType}`;
    };
}
