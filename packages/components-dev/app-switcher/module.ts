import { A11yModule } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    buildFileTree,
    DATA_OBJECT,
    FileFlatNode, FileNode,
    KbqAppSwitcherModule
} from '@koobiq/components/app-switcher';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIcon, KbqIconButton } from '@koobiq/components/icon';
import { FlatTreeControl, KbqTreeFlatDataSource, KbqTreeFlattener, KbqTreeModule } from '@koobiq/components/tree';
import { PopoverExamplesModule } from 'packages/docs-examples/components/popover';

@Component({
    standalone: true,
    imports: [PopoverExamplesModule, KbqButtonModule, KbqIcon, KbqAppSwitcherModule],
    selector: 'dev-examples',
    template: `
        <button kbq-button kbqAppSwitcher>
            <i kbq-icon="kbq-bento-menu_16"></i>
        </button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class DevExamples {}

@Component({
    standalone: true,
    selector: 'dev-app',
    styleUrls: ['./styles.scss'],
    templateUrl: './template.html',
    imports: [
        A11yModule,
        FormsModule,
        DevExamples,
        KbqAppSwitcherModule,
        KbqTreeModule,
        KbqIconButton
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    componentColors = KbqComponentColors;

    treeControl: FlatTreeControl<FileFlatNode>;
    treeFlattener: KbqTreeFlattener<FileNode, FileFlatNode>;
    dataSource: KbqTreeFlatDataSource<FileNode, FileFlatNode>;

    modelValue: any = '';

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
