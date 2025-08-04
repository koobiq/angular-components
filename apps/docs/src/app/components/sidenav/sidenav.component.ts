import { Location, ViewportScroller } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { KbqBadgeModule } from '@koobiq/components/badge';
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
import { DocsLocale } from 'src/app/constants/locale';
import { DocsLocaleState } from 'src/app/services/locale';
import { DocsDocStructure, DocsDocStructureCategory, DocsDocStructureCategoryItemSection } from 'src/app/structure';
import { DocsDocStates } from '../../services/doc-states';
import { DocsFooterComponent } from '../footer/footer.component';

enum TreeNodeType {
    Category = 'Category',
    Item = 'Item'
}

class TreeNode {
    constructor(
        public id: string,
        public children: TreeNode[] | null,
        public name: Record<DocsLocale, string>,
        public type: TreeNodeType,
        public isNew: boolean = false
    ) {}
}

/** Flat node with expandable and level information */
class TreeFlatNode {
    id: string;
    name: Record<DocsLocale, string>;
    level: number;
    expandable: boolean;
    parent: any;
    type: TreeNodeType;
    isNew: boolean;
}

function buildTree(categories: DocsDocStructureCategory[]): TreeNode[] {
    const data: TreeNode[] = [];

    categories.forEach(({ id, name, items }) => {
        data.push(
            new TreeNode(
                id,
                items.map((item) => new TreeNode(item.id, null, item.name, TreeNodeType.Item, item.isNew)),
                name,
                TreeNodeType.Category
            )
        );
    });

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
        RouterLink,
        KbqBadgeModule
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
export class DocsSidenavComponent extends DocsLocaleState implements AfterViewInit {
    @ViewChild(KbqScrollbar) readonly sidenavMenuContainer: KbqScrollbar;
    @ViewChild(KbqTreeSelection) readonly tree: KbqTreeSelection;

    protected readonly docStates = inject(DocsDocStates);
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

        this.router.navigateByUrl(`${this.locale()}/${value}`);

        this.docStates.closeNavbarMenu();

        this.viewportScroller.scrollToPosition([0, 0]);
    }

    private _selectedItem: string;

    constructor() {
        super();

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
        this.dataSource.data = buildTree(DocsDocStructure.getCategories());
    }

    ngAfterViewInit() {
        this.selectDefaultItem();
        this.treeControl.expandAll();
        this.docStates.registerNavbarScrollContainer(this.sidenavMenuContainer.contentElement.nativeElement);
    }

    private selectDefaultItem(): void {
        // remove extra path endpoints so tree node can be selected
        this._selectedItem = Object.values(DocsDocStructureCategoryItemSection).reduce(
            (resUrl, currentValue) => resUrl.replace(new RegExp(`\\/${currentValue}.*`), ''),
            this.location.path().replace(`/${this.locale()}/`, '')
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
        flatNode.isNew = node.isNew;

        return flatNode;
    };

    private getLevel = (node: TreeFlatNode): number => {
        return node.level;
    };

    private isExpandable = (node: TreeFlatNode): boolean => {
        return node.expandable;
    };

    private getChildren = (node: TreeNode): TreeNode[] | null => {
        return node.children;
    };

    private getValue = (node: TreeFlatNode): string => {
        return node.id;
    };

    private getViewValue = (node: TreeFlatNode): string => {
        return node.id;
    };
}
