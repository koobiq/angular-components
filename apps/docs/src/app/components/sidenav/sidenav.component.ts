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
    template: `
        <a routerLink="/" class="docs-sidenav__header" [class.docs-top-overflown]="docStates.navbarTopOverflown.value">
            <!-- prettier-ignore -->
            <svg fill="none" height="21" viewBox="0 0 18 19" width="18" xmlns="http://www.w3.org/2000/svg" class="docs-sidenav__header-logo"><path d="M17.5625 11.1001H11.4375C11.1959 11.1001 11 11.296 11 11.5376V17.6626C11 17.9043 11.1959 18.1001 11.4375 18.1001H17.5625C17.8042 18.1001 18 17.9043 18 17.6626V11.5376C18 11.296 17.8042 11.1001 17.5625 11.1001Z" fill="#FF0000"/><path clip-rule="evenodd" d="M6.5625 0.100098H0.4375C0.196875 0.100098 0 0.296973 0 0.537598V6.6626C0 6.90322 0.196875 7.1001 0.4375 7.1001H3.0625C3.30312 7.1001 3.5 6.90322 3.5 6.6626V4.0376C3.5 3.79697 3.69688 3.6001 3.9375 3.6001H6.5625C6.80312 3.6001 7 3.40322 7 3.1626V0.537598C7 0.296973 6.80312 0.100098 6.5625 0.100098Z" fill="#FF0000" fill-rule="evenodd"/><path clip-rule="evenodd" d="M6.5625 11.1001H0.4375C0.196875 11.1001 0 11.297 0 11.5376V14.1626C0 14.4032 0.196875 14.6001 0.4375 14.6001H3.0625C3.30312 14.6001 3.5 14.797 3.5 15.0376V17.6626C3.5 17.9032 3.69688 18.1001 3.9375 18.1001H6.5625C6.80312 18.1001 7 17.9032 7 17.6626V11.5376C7 11.297 6.80312 11.1001 6.5625 11.1001Z" fill="#FF0000" fill-rule="evenodd"/><path clip-rule="evenodd" d="M17.5625 0.100098H14.9375C14.6969 0.100098 14.5 0.296973 14.5 0.537598V3.1626C14.5 3.40322 14.3031 3.6001 14.0625 3.6001H11.4375C11.1969 3.6001 11 3.79697 11 4.0376V6.6626C11 6.90322 11.1969 7.1001 11.4375 7.1001H17.5625C17.8031 7.1001 18 6.90322 18 6.6626V0.537598C18 0.296973 17.8031 0.100098 17.5625 0.100098Z" fill="#FF0000" fill-rule="evenodd"/></svg>
            <!-- prettier-ignore -->
            <svg height="25" viewBox="0 0 78 25" width="78" xmlns="http://www.w3.org/2000/svg" class="docs-sidenav__header-text"><path d="M74.1362 24.2332V17.1036H74.0055C73.5087 18.0797 72.4715 19.4481 70.1705 19.4481C67.0153 19.4481 64.6533 16.9467 64.6533 12.5364C64.6533 8.0739 67.0851 5.65088 70.1792 5.65088C72.5412 5.65088 73.5261 7.07157 74.0055 8.03903H74.1972V5.8252H77.3001V24.2332H74.1362ZM71.0508 16.8595C73.0642 16.8595 74.1972 15.1163 74.1972 12.519C74.1972 9.92166 73.0816 8.2395 71.0508 8.2395C68.9503 8.2395 67.8695 10.0263 67.8695 12.519C67.8695 15.0292 68.9677 16.8595 71.0508 16.8595Z"/><path d="M58.8554 19.213V5.82541H62.0105V19.213H58.8554ZM60.4417 3.92535C59.4306 3.92535 58.6113 3.15835 58.6113 2.21703C58.6113 1.267 59.4306 0.5 60.4417 0.5C61.444 0.5 62.2633 1.267 62.2633 2.21703C62.2633 3.15835 61.444 3.92535 60.4417 3.92535Z"/><path d="M43.4824 19.2129V1.36279H46.6376V8.03917H46.7683C47.2477 7.0717 48.2326 5.65101 50.5946 5.65101C53.6887 5.65101 56.1205 8.07403 56.1205 12.5366C56.1205 16.9468 53.7585 19.4483 50.6033 19.4483C48.3023 19.4483 47.2651 18.0799 46.7683 17.1037H46.5853V19.2129H43.4824ZM46.5766 12.5191C46.5766 15.1165 47.7096 16.8596 49.723 16.8596C51.8061 16.8596 52.9043 15.0293 52.9043 12.5191C52.9043 10.0264 51.8235 8.23963 49.723 8.23963C47.6922 8.23963 46.5766 9.9218 46.5766 12.5191Z"/><path d="M34.2499 19.4743C30.3277 19.4743 27.835 16.7113 27.835 12.5713C27.835 8.42253 30.3277 5.65088 34.2499 5.65088C38.172 5.65088 40.6648 8.42253 40.6648 12.5713C40.6648 16.7113 38.172 19.4743 34.2499 19.4743ZM34.2673 16.9467C36.4027 16.9467 37.466 15.0117 37.466 12.5626C37.466 10.1134 36.4027 8.15234 34.2673 8.15234C32.097 8.15234 31.0337 10.1134 31.0337 12.5626C31.0337 15.0117 32.097 16.9467 34.2673 16.9467Z"/><path d="M19.3172 19.4743C15.3951 19.4743 12.9023 16.7113 12.9023 12.5713C12.9023 8.42253 15.3951 5.65088 19.3172 5.65088C23.2394 5.65088 25.7321 8.42253 25.7321 12.5713C25.7321 16.7113 23.2394 19.4743 19.3172 19.4743ZM19.3347 16.9467C21.4701 16.9467 22.5334 15.0117 22.5334 12.5626C22.5334 10.1134 21.4701 8.15234 19.3347 8.15234C17.1644 8.15234 16.1011 10.1134 16.1011 12.5626C16.1011 15.0117 17.1644 16.9467 19.3347 16.9467Z"/><path d="M0.0551758 19.2129V1.36279H3.21033V11.203H3.42823L8.2394 5.82533H11.9262L6.74026 11.604L12.2313 19.2129H8.4573L4.36083 13.4866L3.21033 14.7155V19.2129H0.0551758Z"/></svg>
        </a>

        <div kbq-scrollbar class="docs-sidenav__menu">
            <kbq-tree-selection
                [autoSelect]="false"
                [dataSource]="dataSource"
                [treeControl]="treeControl"
                [(ngModel)]="selectedNodeId"
            >
                <kbq-tree-option
                    *kbqTreeNodeDef="let node; when: hasChild"
                    class="docs-sidenav__category"
                    (click)="handleCategoryClick($event, node)"
                    (keydown.enter)="handleCategoryClick($event, node)"
                >
                    <div class="docs-sidenav__category-text">
                        <span>{{ node.name[locale()] }}</span>
                        <i
                            kbq-icon-button="kbq-chevron-down-s_16"
                            kbq-tree-node-toggle
                            class="docs-sidenav__category-icon"
                            [class.docs-sidenav__category-icon_collapsed]="!treeControl.isExpanded(node)"
                            [class.cdk-visually-hidden]="node.id === 'icons'"
                        ></i>
                    </div>
                </kbq-tree-option>

                <kbq-tree-option
                    *kbqTreeNodeDef="let node"
                    class="docs-sidenav__item"
                    (click)="handleItemClick($event, node)"
                    (keydown.enter)="handleItemClick($event, node)"
                >
                    <a routerLink="{{ locale() }}/{{ node.id }}">
                        {{ node.name[locale()] }}

                        @if (node.isNew) {
                            <kbq-badge badgeColor="fade-theme" [compact]="true" [outline]="true">New</kbq-badge>
                        }
                    </a>
                </kbq-tree-option>
            </kbq-tree-selection>
        </div>

        <kbq-divider />

        <docs-footer />
    `,
    styleUrls: ['./sidenav.component.scss'],
    host: {
        class: 'docs-sidenav'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsSidenavComponent extends DocsLocaleState implements AfterViewInit {
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
