import { Location, ViewportScroller } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    inject,
    model,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
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
import {
    docsGetCategories,
    DocsStructureCategory,
    DocsStructureCategoryId,
    DocsStructureItemTab
} from 'src/app/structure';
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

function buildTree(categories: DocsStructureCategory[]): TreeNode[] {
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
    templateUrl: './sidenav.html',
    styleUrl: './sidenav.scss',
    host: {
        class: 'docs-sidenav'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsSidenav extends DocsLocaleState implements AfterViewInit {
    private readonly scrollbar = viewChild.required(KbqScrollbar);
    private readonly tree = viewChild.required(KbqTreeSelection);
    private readonly viewportScroller = inject(ViewportScroller);
    private readonly router = inject(Router);
    private readonly location = inject(Location);
    protected readonly docStates = inject(DocsDocStates);
    protected readonly treeControl: FlatTreeControl<TreeFlatNode>;
    protected readonly dataSource: KbqTreeFlatDataSource<TreeNode, TreeFlatNode>;
    protected readonly selectedNodeId = model(
        Object.values(DocsStructureItemTab).reduce(
            (resUrl, currentValue) => resUrl.replace(new RegExp(`\\/${currentValue}.*`), ''),
            this.location.path().replace(`/${this.locale()}/`, '')
        )
    );

    constructor() {
        super();

        const treeFlattener = new KbqTreeFlattener<TreeNode, TreeFlatNode>(
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
        this.dataSource.data = buildTree(docsGetCategories());
    }

    ngAfterViewInit() {
        this.treeControl.expandAll();
        this.docStates.registerNavbarScrollContainer(this.scrollbar().contentElement.nativeElement);
        setTimeout(() => this.tree().highlightSelectedOption());
    }

    protected handleItemClick(_event: Event, node: TreeFlatNode): void {
        this.router.navigate([`${this.locale()}/${node.id}`]);
        this.docStates.closeNavbarMenu();
        this.viewportScroller.scrollToPosition([0, 0]);
    }

    protected handleCategoryClick(event: Event, node: TreeFlatNode): void {
        if (node.id === DocsStructureCategoryId.Icons) {
            // We should navigate to the /icons page instead of expanding the category
            this.router.navigate([this.locale(), node.id]);

            return;
        }

        this.treeControl.toggle(node);
        event.stopPropagation();
    }

    protected hasChild(_: number, nodeData: TreeFlatNode): boolean {
        return nodeData.expandable;
    }

    private transformer = (node: TreeNode, level: number, parent: TreeFlatNode | null): TreeFlatNode => {
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
