import { ChangeDetectionStrategy, Component, computed, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagsModule } from '@koobiq/components/tags';
import { FlatTreeControl, KbqTreeFlatDataSource, KbqTreeFlattener, KbqTreeModule } from '@koobiq/components/tree';
import { KbqTreeSelectModule } from '@koobiq/components/tree-select';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

export class FileNode {
    children?: FileNode[];
    id = '';
    name = '';
}

/** Flat node with expandable and level information */
export class FileFlatNode {
    id = '';
    name = '';
    level = 0;
    expandable = false;
    parent: any;
}

/**
 * @title tree-select-custom-tag-content
 */
@Component({
    selector: 'tree-select-custom-tag-content-example',
    imports: [FormsModule, KbqTreeModule, KbqTreeSelectModule, KbqTagsModule, KbqIconModule],
    template: `
        <kbq-form-field>
            <kbq-tree-select multiple [placeholder]="t().placeholder" [(ngModel)]="selected">
                <!--
                    The context is a trigger value, not the option the select keeps in its panel, so
                    removal goes through onRemoveSelectedOption — the tag is all the trigger has.
                -->
                <ng-template #kbqSelectTagContent let-option let-select="select">
                    <kbq-tag
                        [selectable]="false"
                        [disabled]="option.disabled || select.disabled()"
                        [color]="severities()[option.value]?.color"
                    >
                        <i kbqTagPrefix [kbq-icon]="severities()[option.value]?.icon"></i>
                        {{ option.viewValue }}
                        <!-- The custom template replaces the built-in markup, so the remove control is up to us. -->
                        @if (!option.disabled && !select.disabled()) {
                            <i
                                kbq-icon="kbq-xmark-s_16"
                                kbqTagRemove
                                [tabIndex]="0"
                                [aria-label]="t().removeItem(option.viewValue)"
                                (click)="select.onRemoveSelectedOption(option, $event)"
                            ></i>
                        }
                    </kbq-tag>
                </ng-template>

                <kbq-tree-selection [dataSource]="dataSource" [treeControl]="treeControl">
                    <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                        {{ treeControl.getViewValue(node) }}
                    </kbq-tree-option>
                </kbq-tree-selection>

                <kbq-cleaner />
            </kbq-tree-select>
        </kbq-form-field>
    `,
    styles: `
        .kbq-form-field {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-column layout-align-center-center'
    }
})
export class TreeSelectCustomTagContentExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    /**
     * Per-value tag appearance — the built-in markup paints every tag with the same color.
     * Only these four colors are themed for `kbq-tag`. The ids are locale-independent, so the
     * selection and the styling survive switching the examples language.
     */
    readonly severities = computed<Record<string, { name: string; color: KbqComponentColors; icon: string }>>(() => {
        const [critical, major, minor, info] = this.t().severities;

        return {
            critical: { name: critical!, color: KbqComponentColors.Error, icon: 'kbq-circle-xmark_16' },
            major: { name: major!, color: KbqComponentColors.Warning, icon: 'kbq-triangle-exclamation_16' },
            minor: { name: minor!, color: KbqComponentColors.Theme, icon: 'kbq-circle-info_16' },
            info: { name: info!, color: KbqComponentColors.ContrastFade, icon: 'kbq-circle-info_16' }
        };
    });

    /** Selected severity ids; not readonly, because the field is bound with `[(ngModel)]`. */
    selected = ['critical', 'major', 'minor'];
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

        // A leaf per severity: the node id is the value the selection and the `severities` lookup use,
        // the name is the translated label — rebuilt when the examples language changes.
        effect(() => {
            this.dataSource.data = Object.entries(this.severities()).map(([id, severity]) => {
                const node = new FileNode();

                node.id = id;
                node.name = severity.name;

                return node;
            });
        });
    }

    private readonly transformer = (node: FileNode, level: number, parent: any) => {
        const flatNode = new FileFlatNode();

        flatNode.id = node.id;
        flatNode.name = node.name;
        flatNode.parent = parent;
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
        return node.id;
    };

    private readonly getViewValue = (node: FileFlatNode): string => {
        return node.name;
    };
}
