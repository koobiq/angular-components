import { ViewportScroller } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { KbqScrollbar } from '@koobiq/components/scrollbar';
import { FlatTreeControl, KbqTreeFlatDataSource, KbqTreeFlattener, KbqTreeSelection } from '@koobiq/components/tree';
import { delay } from 'rxjs';
import { map } from 'rxjs/operators';
import { DocCategory, DocumentationItems, documentationItemSections } from '../documentation-items';
import { DocStates } from '../doс-states';

enum TreeNodeType {
    Category = 'Category',
    Item = 'Item'
}
class TreeNode {
    constructor(
        public id: string,
        public children: TreeNode[] | null,
        public name: string,
        public type: TreeNodeType
    ) {}
}

/** Flat node with expandable and level information */
export class TreeFlatNode {
    id: string;
    name: string;
    level: number;
    expandable: boolean;
    parent: any;
    type: TreeNodeType;
}

export function buildTree(categories: DocCategory[]): TreeNode[] {
    const data: any[] = [];

    for (const cat of categories) {
        const node = new TreeNode(
            cat.id,
            cat.items.map((item) => new TreeNode(item.id, null, item.name, TreeNodeType.Item)),
            cat.name,
            TreeNodeType.Category
        );

        data.push(node);
    }

    return data;
}

@Component({
    selector: 'docs-sidenav',
    templateUrl: './sidenav.component.html',
    styleUrls: ['./sidenav.scss'],
    host: {
        class: 'docs-sidenav'
    },
    encapsulation: ViewEncapsulation.None
})
export class ComponentSidenav implements AfterViewInit, OnInit {
    @ViewChild(KbqScrollbar) sidenavMenuContainer: KbqScrollbar;
    @ViewChild('tree') tree: KbqTreeSelection;

    set category(value: string) {
        if (!value || value === this._category) {
            return;
        }

        this.dataSource.data = buildTree(this.docItems.getCategories(value));

        this._category = value;
    }

    private _category: string;

    treeControl: FlatTreeControl<TreeFlatNode>;
    treeFlattener: KbqTreeFlattener<TreeNode, TreeFlatNode>;

    dataSource: KbqTreeFlatDataSource<TreeNode, TreeFlatNode>;

    get selectedItem(): string {
        return this._selectedItem;
    }

    set selectedItem(value: string) {
        if (!value || this._selectedItem === value || (value !== 'icons' && value.search('/') === -1)) {
            return;
        }

        this._selectedItem = value;

        this.router.navigateByUrl(value);

        this.docStates.closeNavbarMenu();

        this.viewportScroller.scrollToPosition([0, 0]);
    }

    private _selectedItem: string;
    private readonly destroyRef = inject(DestroyRef);

    constructor(
        public docStates: DocStates,
        private docItems: DocumentationItems,
        private router: Router,
        private routeActivated: ActivatedRoute,
        private viewportScroller: ViewportScroller
    ) {
        this.treeFlattener = new KbqTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);

        this.treeControl = new FlatTreeControl<TreeFlatNode>(
            this.getLevel,
            this.isExpandable,
            this.getValue,
            this.getViewValue
        );

        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.dataSource.data = buildTree(this.docItems.getCategories());
    }

    ngOnInit() {
        this.routeActivated.url
            .pipe(
                map(([first, second]: UrlSegment[]) => {
                    if (second) {
                        return [first.path, second?.path].join('/');
                    }

                    return first.path;
                }),
                delay(0),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((url: string) => {
                if (!url) {
                    this.needSelectDefaultItem();
                }
            });
    }

    ngAfterViewInit() {
        this.treeControl.expandAll();

        this.docStates.registerNavbarScrollContainer(this.sidenavMenuContainer.contentElement.nativeElement);
    }

    needSelectDefaultItem = () => {
        // remove extra path endpoints so tree node can be selected
        this._selectedItem = documentationItemSections.reduce(
            (resUrl, currentValue) => resUrl.replace(new RegExp(`\\/${currentValue}.*`), ''),
            this.router.url.replace('/', '')
        );

        setTimeout(() => this.tree.highlightSelectedOption());
    };

    hasChild(_: number, nodeData: TreeFlatNode) {
        return nodeData.expandable;
    }

    toggle($event: MouseEvent, node) {
        if (node.id !== 'icons') {
            this.treeControl.toggle(node);

            $event.stopPropagation();
        }
    }

    private transformer = (node: TreeNode, level: number, parent: any) => {
        const flatNode = new TreeFlatNode();

        flatNode.id = parent ? `${parent.id}/${node.id}` : `${node.id}`;
        flatNode.name = node.name;
        flatNode.parent = parent;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children;

        return flatNode;
    };

    private getLevel = (node: TreeFlatNode) => {
        return node.level;
    };

    private isExpandable = (node: TreeFlatNode) => {
        return node.expandable;
    };

    private getChildren = (node: TreeNode): TreeNode[] | null => {
        return node.children;
    };

    private getValue = (node: TreeFlatNode) => {
        return node.id;
    };

    private getViewValue = (node: TreeFlatNode): string => {
        return node.name;
    };
}
