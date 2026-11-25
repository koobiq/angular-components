import { CdkScrollable } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqOverflowShadowContainer, KbqOverlayLayer } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTopBarModule } from '@koobiq/components/top-bar';
import { FlatTreeControl, KbqTreeFlatDataSource, KbqTreeFlattener, KbqTreeModule } from '@koobiq/components/tree';
import { KbqTreeSelectModule } from '@koobiq/components/tree-select';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { buildFileTree, DATA_OBJECT, FileFlatNode, type FileNode } from '../tree-select-data';
import { TRANSLATIONS } from './l10n';

/**
 * @title Tree-select scrolling and layering page
 */
@Component({
    selector: 'tree-select-scrolling-and-layering-page-example',
    imports: [
        KbqTopBarModule,
        CdkScrollable,
        KbqOverflowShadowContainer,
        KbqOverlayLayer,
        KbqTreeSelectModule,
        KbqTreeModule,
        KbqIconModule,
        FormsModule
    ],
    template: `
        <kbq-top-bar [withShadow]="scroller.overflow().top">
            <div class="layout-row layout-align-center-center" kbqTopBarContainer placement="start">
                <span class="kbq-truncate-line" kbqTopBarTitle>Page Title</span>
            </div>

            <div kbqTopBarSpacer></div>
        </kbq-top-bar>

        <div
            #scroller="kbqOverflowShadowContainer"
            class="example-text-container layout-padding-left-xxl"
            cdk-scrollable
            kbqOverflowShadowContainer
            kbqOverlayLayer
        >
            <kbq-form-field>
                <kbq-label>{{ t().label }}</kbq-label>
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

            <p>
                Open the select and scroll this page: its panel follows the field and slides under the sticky top bar,
                while the page content keeps scrolling behind it.
            </p>
            <p>
                A tree-select lets the user pick one or more values from a hierarchy. Its panel is tethered to the field
                that opened it and moves together with that field while the page scrolls.
            </p>
            <p>
                The content area of this page is marked with the kbqOverlayLayer directive. Panels opened from inside
                that area render into an overlay layer of their own, which sits below the top bar but above the rest of
                the page content.
            </p>
            <p>
                Panels opened from the top bar, as well as modals, sidepanels, toasts and tooltips, stay in the
                application-wide overlay container and keep painting above the top bar.
            </p>
            <p>
                The same approach works for a top bar placed inside the scrolling area, and for the horizontal navbar.
            </p>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;

            margin: 0 auto;
        }

        .example-text-container {
            display: flex;
            flex-direction: column;

            overflow-y: scroll;

            height: 344px;
            padding-left: var(--kbq-size-xl);
        }

        .kbq-form-field {
            width: 320px;
            align-self: center;

            margin-top: var(--kbq-size-l);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeSelectScrollingAndLayeringPageExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    selected = 'docs';

    readonly treeControl: FlatTreeControl<FileFlatNode>;
    readonly dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    constructor() {
        this.treeControl = this.createTreeControl();
        this.dataSource = this.createDataSource(this.treeControl, buildFileTree(DATA_OBJECT, 0));
    }

    protected hasChild(_: number, node: FileFlatNode): boolean {
        return node.expandable;
    }

    private createTreeControl(): FlatTreeControl<FileFlatNode> {
        return new FlatTreeControl<FileFlatNode>(this.getLevel, this.isExpandable, this.getValue, this.getViewValue);
    }

    private createDataSource(
        treeControl: FlatTreeControl<FileFlatNode>,
        data: FileNode[]
    ): KbqTreeFlatDataSource<FileNode, FileFlatNode> {
        const dataSource = new KbqTreeFlatDataSource(
            treeControl,
            new KbqTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren)
        );

        dataSource.data = data;

        return dataSource;
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

    private readonly getLevel = (node: FileFlatNode) => node.level;

    private readonly isExpandable = (node: FileFlatNode) => node.expandable;

    private readonly getChildren = (node: FileNode): FileNode[] | undefined => node.children;

    private readonly getValue = (node: FileFlatNode): string => node.name;

    private readonly getViewValue = (node: FileFlatNode): string => `${node.name} view`;
}
