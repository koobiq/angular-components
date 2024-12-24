import { Location, ViewportScroller } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqScrollbar, KbqScrollbarModule } from '@koobiq/components/scrollbar';
import {
    FlatTreeControl,
    KbqTreeFlatDataSource,
    KbqTreeFlattener,
    KbqTreeModule,
    KbqTreeSelection
} from '@koobiq/components/tree';
import { DocsLocaleService } from 'src/app/services/locale.service';
import { DocCategory, DOCS_ITEM_SECTIONS, DocumentationItems } from '../../services/documentation-items';
import { DocStates } from '../../services/doс-states';
import { DocsFooterComponent } from '../footer/footer.component';

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
class TreeFlatNode {
    id: string;
    name: string;
    level: number;
    expandable: boolean;
    parent: any;
    type: TreeNodeType;
}

function buildTree(categories: DocCategory[]): TreeNode[] {
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
    standalone: true,
    imports: [
        FormsModule,
        KbqIconModule,
        KbqTreeModule,
        KbqDividerModule,
        DocsFooterComponent,
        KbqScrollbarModule,
        RouterLink
    ],
    selector: 'docs-sidenav',
    templateUrl: './sidenav.component.html',
    styleUrls: ['./sidenav.component.scss'],
    host: {
        class: 'docs-sidenav'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsSidenavComponent implements AfterViewInit {
    @ViewChild(KbqScrollbar) readonly sidenavMenuContainer: KbqScrollbar;
    @ViewChild(KbqTreeSelection) readonly tree: KbqTreeSelection;

    private readonly docsLocaleService = inject(DocsLocaleService);
    protected readonly docStates = inject(DocStates);
    private readonly docItems = inject(DocumentationItems);
    private readonly router = inject(Router);
    private readonly viewportScroller = inject(ViewportScroller);
    private readonly location = inject(Location);

    readonly treeControl: FlatTreeControl<TreeFlatNode>;
    readonly dataSource: KbqTreeFlatDataSource<TreeNode, TreeFlatNode>;

    get selectedItem(): string {
        return this._selectedItem;
    }

    set selectedItem(value: string) {
        if (!value || this._selectedItem === value || (value !== 'icons' && value.search('/') === -1)) {
            return;
        }

        this._selectedItem = value;

        this.router.navigateByUrl(`${this.docsLocaleService.locale}/${value}`);

        this.docStates.closeNavbarMenu();

        this.viewportScroller.scrollToPosition([0, 0]);
    }

    private _selectedItem: string;

    constructor() {
        const treeFlattener = new KbqTreeFlattener(
            this.transformer,
            this.getLevel,
            this.isExpandable,
            this.getChildren
        );
        this.treeControl = new FlatTreeControl<TreeFlatNode>(
            this.getLevel,
            this.isExpandable,
            this.getValue,
            this.getViewValue
        );
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, treeFlattener);
        this.dataSource.data = buildTree(this.docItems.getCategories());
    }

    ngAfterViewInit() {
        this.selectDefaultItem();
        this.treeControl.expandAll();
        this.docStates.registerNavbarScrollContainer(this.sidenavMenuContainer.contentElement.nativeElement);
    }

    private selectDefaultItem(): void {
        // remove extra path endpoints so tree node can be selected
        this._selectedItem = DOCS_ITEM_SECTIONS.reduce(
            (resUrl, currentValue) => resUrl.replace(new RegExp(`\\/${currentValue}.*`), ''),
            this.location.path().replace(`/${this.docsLocaleService.locale}/`, '')
        );
        setTimeout(() => this.tree.highlightSelectedOption());
    }

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
