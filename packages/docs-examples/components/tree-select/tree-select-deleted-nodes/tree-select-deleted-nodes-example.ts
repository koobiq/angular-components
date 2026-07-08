import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagsModule } from '@koobiq/components/tags';
import {
    defaultCompareValues,
    defaultCompareViewValues,
    FlatTreeControl,
    KbqTreeFlatDataSource,
    KbqTreeFlattener,
    KbqTreeModule
} from '@koobiq/components/tree';
import { KbqTreeSelectModule } from '@koobiq/components/tree-select';

export class FileNode {
    id: string;
    children: FileNode[];
    name: string;
    type: any;
}

/** Flat node with expandable and level information. */
export class FileFlatNode {
    id: string;
    name: string;
    type: any;
    level: number;
    expandable: boolean;
    parent: FileFlatNode | null;
}

/**
 * Builds the file structure tree. Each node gets a stable, unique `id` (its path) that is used as
 * the node value/identity — unlike the display name, which may be duplicated across branches.
 */
export function buildFileTree(value: any, level: number, parentId: string = ''): FileNode[] {
    return Object.keys(value).map((key) => {
        const node = new FileNode();

        node.id = parentId ? `${parentId}/${key}` : key;
        node.name = key;

        const childValue = value[key];

        if (childValue !== null && typeof childValue === 'object') {
            node.children = buildFileTree(childValue, level + 1, node.id);
        } else {
            node.type = childValue;
        }

        return node;
    });
}

export const DATA_OBJECT = {
    Documents: {
        report: 'pdf',
        budget: 'xlsx'
    },
    Downloads: {
        Tutorial: 'html',
        November: 'pdf',
        October: 'pdf'
    },
    Applications: {
        Chrome: 'app',
        Calendar: 'app'
    }
};

/**
 * @title tree-select-deleted-nodes
 */
@Component({
    selector: 'tree-select-deleted-nodes-example',
    imports: [
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqTreeModule,
        KbqTreeSelectModule,
        KbqTagsModule,
        KbqIconModule
    ],
    template: `
        <kbq-form-field>
            <kbq-tree-select
                multiple="true"
                multiline="true"
                [formControl]="control"
                [errorStateMatcher]="deletedNodesErrorStateMatcher"
            >
                <ng-template #kbqSelectTagContent let-option let-select="select">
                    <kbq-tag
                        [selectable]="false"
                        [disabled]="option.disabled || select.disabled"
                        [color]="deletedIds.has(option.value) ? 'error' : ''"
                    >
                        {{ option.viewValue }}
                        <!-- error (deleted) tags stay removable even when the node is disabled -->
                        @if (!select.disabled && (deletedIds.has(option.value) || !option.disabled)) {
                            <i
                                kbq-icon="kbq-xmark-s_16"
                                kbqTagRemove
                                [color]="deletedIds.has(option.value) && !option.disabled ? 'error' : ''"
                                (click)="select.onRemoveSelectedOption(option, $event)"
                            ></i>
                        }
                    </kbq-tag>
                </ng-template>

                <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                    <!--
                        Deleted nodes (and the whole subtree of a deleted parent): an empty template, so they
                        don't render in the panel and never enter renderedOptions, yet stay in the data and
                        therefore still produce a tag in the matcher.
                    -->
                    <ng-container *kbqTreeNodeDef="let node; when: isDeleted" />

                    <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>

                    <kbq-tree-option *kbqTreeNodeDef="let node; when: hasChild" kbqTreeNodePadding>
                        <i
                            kbq-icon="kbq-chevron-down-s_16"
                            kbqTreeNodeToggle
                            [style.transform]="treeControl.isExpanded(node) ? '' : 'rotate(-90deg)'"
                        ></i>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>
            </kbq-tree-select>

            <!-- Visible textual reason for the error state: shown even if a red tag was collapsed into the overflow counter -->
            @if (deletedCount > 0) {
                <kbq-hint>Удалено элементов: {{ deletedCount }} — удалите их из выбора</kbq-hint>
            }
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeSelectDeletedNodesExample {
    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: KbqTreeFlattener<FileNode, FileFlatNode>;
    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    // Selected values, by id. Two of them reference nodes that the backend reports as deleted.
    control = new UntypedFormControl([
        'Applications/Calendar',
        'Downloads/November',
        'Downloads/October'
    ]);

    // Single source of truth for "deleted", rebuilt from the backend list on every (re)load.
    deletedIds = new Set<string>();

    // Forces the field into an error (visual) state while any deleted node is selected — this only
    // drives the displayed error, it does not change FormControl validity (no validator is added).
    // It ORs the default matcher so real Validators (required/pattern/server) are not masked; it is
    // keyed by id and clears reactively.
    deletedNodesErrorStateMatcher: ErrorStateMatcher = {
        isErrorState: (control, form): boolean =>
            this.defaultErrorStateMatcher.isErrorState(control as any, form) ||
            (Array.isArray(control?.value) && control!.value.some((id: string) => this.deletedIds.has(id)))
    };

    // The explicit list of deleted ids as it would arrive from the backend.
    private readonly backendDeletedIds = ['Downloads/November', 'Downloads/October'];

    constructor(
        private readonly changeDetectorRef: ChangeDetectorRef,
        private readonly defaultErrorStateMatcher: ErrorStateMatcher
    ) {
        this.treeFlattener = new KbqTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);

        // The tree resolves nodes by their stable id; one deleted node is disabled to show that its
        // error tag stays removable even when disabled.
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

        this.setTreeData(buildFileTree(DATA_OBJECT, 0));
    }

    /**
     * (Re)loads the tree. Safe to call on every backend refresh: it rebuilds `deletedIds` from the
     * backend list BEFORE assigning the data (so the node-defs read the fresh set on re-render),
     * which is why a runtime reload never "loses" the deleted state the way a per-node flag would.
     */
    setTreeData(raw: FileNode[]): void {
        this.deletedIds = new Set(this.backendDeletedIds);
        this.dataSource.data = raw;
        this.changeDetectorRef.markForCheck();
    }

    /** Count of currently-selected values that are deleted — drives the explanatory hint. */
    get deletedCount(): number {
        return ((this.control.value as string[]) || []).filter((id) => this.deletedIds.has(id)).length;
    }

    // Hide a deleted node (and the whole subtree of a deleted parent) from the dropdown.
    isDeleted = (_: number, node: FileFlatNode): boolean => this.isDeletedNode(node);

    // Expandable-but-not-deleted. Making these mutually exclusive means a deleted expandable node
    // always falls into the empty `isDeleted` def regardless of node-def declaration order.
    hasChild = (_: number, node: FileFlatNode): boolean => node.expandable && !this.isDeletedNode(node);

    private isDeletedNode(node: FileFlatNode | null): boolean {
        for (let current = node; current; current = current.parent) {
            if (this.deletedIds.has(current.id)) {
                return true;
            }
        }

        return false;
    }

    private transformer = (node: FileNode, level: number, parent: FileFlatNode | null) => {
        const flatNode = new FileFlatNode();

        flatNode.id = node.id;
        flatNode.name = node.name;
        flatNode.parent = parent;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children;

        return flatNode;
    };

    private getLevel = (node: FileFlatNode) => node.level;

    private isExpandable = (node: FileFlatNode) => node.expandable;

    private getChildren = (node: FileNode): FileNode[] => node.children;

    // Identity is the stable id, not the display name.
    private getValue = (node: FileFlatNode): string => node.id;

    private getViewValue = (node: FileFlatNode): string => node.name;

    // One deleted node is disabled to demonstrate that its error tag stays removable.
    private isDisabled = (node: FileFlatNode): boolean => node.id === 'Downloads/November';
}
