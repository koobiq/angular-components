import { CdkScrollableModule, ScrollDispatcher, ViewportRuler } from '@angular/cdk/scrolling';
import {
    type AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    inject,
    NgZone,
    viewChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
    KBQ_SELECT_SCROLL_STRATEGY,
    type KbqAutoHideScrollStrategy,
    kbqAutoHideScrollStrategyFactory
} from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqNativeScrollbar } from '@koobiq/components/scrollbar';
import { FlatTreeControl, KbqTreeFlatDataSource, KbqTreeFlattener, KbqTreeModule } from '@koobiq/components/tree';
import { KbqTreeSelect, KbqTreeSelectModule } from '@koobiq/components/tree-select';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { buildFileTree, DATA_OBJECT, FileFlatNode, type FileNode } from '../tree-select-data';
import { TRANSLATIONS } from './l10n';

/**
 * @title tree-select-scroll-strategy
 */
@Component({
    selector: 'tree-select-scroll-strategy-example',
    imports: [CdkScrollableModule, FormsModule, KbqTreeModule, KbqTreeSelectModule, KbqNativeScrollbar, KbqIconModule],
    template: `
        <div class="example-tree-select-scroll-strategy__container" kbqNativeScrollbar cdkScrollable>
            <div class="example-tree-select-scroll-strategy__spacer">{{ t().scrollDown }}</div>

            <kbq-form-field>
                <kbq-tree-select [(ngModel)]="selected">
                    <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
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
            </kbq-form-field>

            <div class="example-tree-select-scroll-strategy__spacer">{{ t().scrollUp }}</div>
        </div>
    `,
    styles: `
        .example-tree-select-scroll-strategy__container {
            height: 200px;
            overflow-y: auto;
            border: 1px solid var(--kbq-line-contrast-less);
            border-radius: 4px;
            padding: 16px;
        }

        .example-tree-select-scroll-strategy__spacer {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 250px;
            color: var(--kbq-foreground-contrast-secondary);
        }
    `,
    providers: [
        {
            provide: KBQ_SELECT_SCROLL_STRATEGY,
            useFactory: () => {
                const scrollDispatcher = inject(ScrollDispatcher);
                const viewportRuler = inject(ViewportRuler);
                const ngZone = inject(NgZone);

                return kbqAutoHideScrollStrategyFactory(scrollDispatcher, viewportRuler, ngZone);
            }
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeSelectScrollStrategyExample implements AfterViewInit {
    private readonly destroyRef = inject(DestroyRef);

    private readonly select = viewChild.required(KbqTreeSelect);

    protected readonly t = injectTranslation(TRANSLATIONS);
    selected = 'docs';
    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: KbqTreeFlattener<FileNode, FileFlatNode>;
    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.treeFlattener = new KbqTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);

        this.treeControl = new FlatTreeControl<FileFlatNode>(
            this.getLevel,
            this.isExpandable,
            this.getValue,
            this.getViewValue
        );
        this.dataSource = new KbqTreeFlatDataSource(this.treeControl, this.treeFlattener);

        this.dataSource.data = buildFileTree(DATA_OBJECT, 0);
    }

    ngAfterViewInit(): void {
        const select = this.select();

        // `scrollStrategy` is created eagerly as a field initializer, so it's ready to subscribe
        // to as soon as the view is initialized — no need to force-create an overlay first.
        const scrollStrategy = select.scrollStrategy as KbqAutoHideScrollStrategy;

        scrollStrategy.hide.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => select.close());
    }

    hasChild(_: number, nodeData: FileFlatNode) {
        return nodeData.expandable;
    }

    private readonly transformer = (node: FileNode, level: number, parent: any) => {
        const flatNode = new FileFlatNode();

        flatNode.name = node.name;
        flatNode.parent = parent;
        flatNode.type = node.type;
        flatNode.level = level;
        flatNode.expandable = !!node.children;

        return flatNode;
    };

    private readonly getLevel = (node: FileFlatNode) => {
        return node.level;
    };

    private readonly isExpandable = (node: FileFlatNode) => {
        return node.expandable;
    };

    private readonly getChildren = (node: FileNode): FileNode[] | undefined => {
        return node.children;
    };

    private readonly getValue = (node: FileFlatNode): string => {
        return node.name;
    };

    private readonly getViewValue = (node: FileFlatNode): string => {
        return `${node.name} view`;
    };
}
