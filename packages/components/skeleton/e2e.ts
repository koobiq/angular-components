import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqAccordionModule } from '@koobiq/components/accordion';
import { KbqAlertModule } from '@koobiq/components/alert';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqDlModule } from '@koobiq/components/dl';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqRadioModule } from '@koobiq/components/radio';
import { KbqTableModule } from '@koobiq/components/table';
import { KbqTabsModule } from '@koobiq/components/tabs';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { KbqToggleModule } from '@koobiq/components/toggle';
import { FlatTreeControl, KbqTreeFlatDataSource, KbqTreeFlattener, KbqTreeModule } from '@koobiq/components/tree';
import { KbqSkeleton } from './skeleton';
import {
    KbqSkeletonAccordion,
    KbqSkeletonBadge,
    KbqSkeletonButton,
    KbqSkeletonCheckable,
    KbqSkeletonDl,
    KbqSkeletonFormField,
    KbqSkeletonGroup,
    KbqSkeletonIcon,
    KbqSkeletonLink,
    KbqSkeletonTable,
    KbqSkeletonTabs,
    KbqSkeletonTag,
    KbqSkeletonTree,
    KbqSkeletonTypography
} from './skeleton-presets';

/**
 * The skeleton radius is only a fallback, and the cascade decides when it applies: which rule wins is up to
 * specificity, which JSDOM does not compute. Every host is rendered twice, loading and loaded, so a test compares
 * the loading radius with the host's own one instead of a hardcoded value.
 */
@Component({
    selector: 'e2e-skeleton-border-radius',
    imports: [KbqSkeleton, KbqAlertModule, KbqButtonModule, KbqFormFieldModule, KbqInputModule],
    template: `
        @for (loading of [true, false]; track loading) {
            <div class="e2e-skeleton-row" [attr.data-testid]="loading ? 'loading' : 'loaded'">
                <span data-testid="text" [kbqSkeleton]="loading">Inline text</span>
                <div data-testid="block" [kbqSkeleton]="loading">Block without a radius</div>
                <kbq-skeleton class="e2e-skeleton-element" data-testid="element" [kbqSkeleton]="loading" />
                <kbq-skeleton class="e2e-skeleton-circle" data-testid="circle" [kbqSkeleton]="loading" />
                <div class="e2e-skeleton-own" data-testid="own" [kbqSkeleton]="loading">Own radius</div>
                <div class="e2e-skeleton-square" data-testid="square" [kbqSkeleton]="loading">Explicit zero</div>
                <button kbq-button data-testid="button" [kbqSkeleton]="loading">Save</button>
                <kbq-alert data-testid="alert" [compact]="true" [kbqSkeleton]="loading">Alert</kbq-alert>
                <kbq-form-field class="e2e-skeleton-field" data-testid="form-field" [kbqSkeleton]="loading">
                    <input kbqInput value="Value" />
                </kbq-form-field>
            </div>
        }
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: 16px;
            padding: 16px;
        }

        .e2e-skeleton-row {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 16px;
        }

        .e2e-skeleton-element {
            width: 80px;
        }

        .e2e-skeleton-circle {
            width: 40px;
            height: 40px;
            border-radius: 50%;
        }

        .e2e-skeleton-own {
            border-radius: 10px;
        }

        .e2e-skeleton-square {
            border-radius: 0;
        }

        .e2e-skeleton-field {
            width: 200px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSkeletonBorderRadius'
    }
})
export class E2eSkeletonBorderRadius {}

/** The looks of the skeleton, for the screenshots of both themes. */
@Component({
    selector: 'e2e-skeleton-states',
    imports: [KbqSkeleton, KbqButtonModule, KbqIconModule],
    template: `
        <div>
            <span kbqSkeleton>Text in one line</span>
        </div>
        <div>
            <span kbqSkeleton>
                Denial of service is typically accomplished by flooding the targeted machine with superfluous requests.
            </span>
        </div>
        <div class="kbq-title">
            <span kbqSkeleton>Heading</span>
        </div>
        <button kbq-button kbqSkeleton>
            <i kbq-icon="kbq-plus_16"></i>
            Add
        </button>
        <kbq-skeleton class="e2e-skeleton-block" />
        <kbq-skeleton class="e2e-skeleton-avatar" />
    `,
    styles: `
        :host {
            display: inline-grid;
            grid-template-columns: repeat(3, 200px);
            align-items: start;
            justify-items: start;
            gap: 24px;
            padding: 16px;
        }

        .e2e-skeleton-block {
            width: 200px;
            height: 100px;
        }

        .e2e-skeleton-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSkeletonStates'
    }
})
export class E2eSkeletonStates {}

/**
 * Preset sizes come from the design and from the rows of the components the presets stand in for, and only a real
 * layout computes them. The text, the description list, the table and the form fields are rendered next to their
 * presets, so a test compares the lines of the two instead of hardcoded heights.
 */
@Component({
    selector: 'e2e-skeleton-presets',
    imports: [
        KbqSkeleton,
        KbqSkeletonButton,
        KbqSkeletonBadge,
        KbqSkeletonTag,
        KbqSkeletonIcon,
        KbqSkeletonLink,
        KbqSkeletonTypography,
        KbqSkeletonDl,
        KbqSkeletonTable,
        KbqSkeletonGroup,
        KbqSkeletonFormField,
        KbqDlModule,
        KbqTableModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqTextareaModule
    ],
    template: `
        <div class="e2e-skeleton-presets-blocks" data-testid="blocks">
            <kbq-skeleton-button data-testid="button" />
            <kbq-skeleton-badge data-testid="badge" />
            <kbq-skeleton-tag data-testid="tag" />
            <kbq-skeleton-icon data-testid="icon" />
            <kbq-skeleton-link data-testid="link" />
            <div data-testid="block-container">
                <kbq-skeleton class="e2e-skeleton-tall" data-testid="block" />
            </div>
            <kbq-skeleton-button class="e2e-skeleton-wide-button" data-testid="wide-button" />

            <kbq-skeleton-typography data-testid="heading" level="title" />
            <div class="kbq-title" data-testid="real-heading">Title</div>
            <kbq-skeleton-typography data-testid="paragraph" [lines]="4" />
            <div class="kbq-text-normal" data-testid="real-paragraph">
                One
                <br />
                Two
                <br />
                Three
                <br />
                Four
            </div>
            <kbq-skeleton-typography data-testid="compact" level="text-compact" [lines]="2" />
            <div class="kbq-text-compact" data-testid="real-compact">
                One
                <br />
                Two
            </div>
            <kbq-skeleton-typography class="e2e-skeleton-narrow-paragraph" data-testid="narrow-paragraph" [lines]="3" />
        </div>

        <kbq-skeleton-dl data-testid="dl" />
        <kbq-dl data-testid="real-dl">
            @for (row of rows; track row) {
                <kbq-dt>Term</kbq-dt>
                <kbq-dd>Description</kbq-dd>
            }
        </kbq-dl>

        <kbq-skeleton-table data-testid="table" />
        <table kbq-table data-testid="real-table" width="100%">
            <thead>
                <tr>
                    <th>Header</th>
                </tr>
            </thead>
            <tbody>
                @for (row of rows; track row) {
                    <tr>
                        <td>Cell</td>
                    </tr>
                }
            </tbody>
        </table>
        <kbq-skeleton-table
            data-testid="table-widths"
            [columns]="['160px', 'auto', '48px']"
            [header]="false"
            [rows]="1"
        />

        <kbq-skeleton-group data-testid="group" preset="tag" />

        <kbq-skeleton-form-field
            data-testid="form-field-horizontal"
            horizontal
            hint
            labelClass="flex-30"
            contentClass="flex-70"
        />
        <kbq-form-field data-testid="real-form-field-horizontal" horizontal labelClass="flex-30" contentClass="flex-70">
            <kbq-label>Label</kbq-label>
            <input kbqInput />
            <kbq-hint>Hint</kbq-hint>
        </kbq-form-field>

        <kbq-skeleton-form-field data-testid="form-field-vertical" hint />
        <kbq-form-field data-testid="real-form-field-vertical">
            <kbq-label>Label</kbq-label>
            <input kbqInput />
            <kbq-hint>Hint</kbq-hint>
        </kbq-form-field>

        <kbq-skeleton-form-field data-testid="form-field-bare" [label]="false" />
        <kbq-form-field data-testid="real-form-field-bare">
            <input kbqInput />
        </kbq-form-field>

        <kbq-skeleton-form-field data-testid="form-field-textarea" control="textarea" hint />
        <kbq-form-field data-testid="real-form-field-textarea">
            <kbq-label>Label</kbq-label>
            <textarea kbqTextarea></textarea>
            <kbq-hint>Hint</kbq-hint>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: 16px;
            width: 600px;
            padding: 16px;
        }

        .e2e-skeleton-presets-blocks {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
        }

        .e2e-skeleton-presets-blocks > div {
            align-self: stretch;
        }

        .e2e-skeleton-wide-button {
            width: 120px;
        }

        .e2e-skeleton-tall {
            height: 100px;
        }

        .e2e-skeleton-narrow-paragraph {
            width: 300px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSkeletonPresets'
    }
})
export class E2eSkeletonPresets {
    protected readonly rows = [1, 2, 3];
}

type E2eSkeletonTreeNode = {
    name: string;
    children?: E2eSkeletonTreeNode[];
};

type E2eSkeletonTreeFlatNode = {
    name: string;
    level: number;
    expandable: boolean;
};

// Every visible node has children, so each one has a toggle, as in the preset; the second one is expanded.
const E2E_SKELETON_TREE: E2eSkeletonTreeNode[] = [1, 2, 3].map((node) => ({
    name: `Node ${node}`,
    children: [1, 2, 3].map((child) => ({
        name: `Node ${node}.${child}`,
        children: [{ name: `Node ${node}.${child}.1` }]
    }))
}));

/**
 * The presets of components are rendered next to the components they stand in for, so a test compares where the
 * controls, the lines and the rows of the two are instead of hardcoded positions.
 */
@Component({
    selector: 'e2e-skeleton-component-presets',
    imports: [
        KbqSkeletonAccordion,
        KbqSkeletonCheckable,
        KbqSkeletonTabs,
        KbqSkeletonTree,
        KbqAccordionModule,
        KbqCheckboxModule,
        KbqRadioModule,
        KbqToggleModule,
        KbqFormFieldModule,
        KbqTabsModule,
        KbqTreeModule
    ],
    template: `
        <kbq-skeleton-accordion data-testid="accordion" />
        <kbq-accordion data-testid="real-accordion" [useStateSaving]="false">
            @for (row of rows; track row) {
                <kbq-accordion-item>
                    <button kbq-accordion-trigger type="button">Section</button>
                    <kbq-accordion-content>Content</kbq-accordion-content>
                </kbq-accordion-item>
            }
        </kbq-accordion>

        <kbq-skeleton-checkable data-testid="checkbox" hint />
        <kbq-checkbox data-testid="real-checkbox">
            Label
            <kbq-hint>Hint</kbq-hint>
        </kbq-checkbox>

        <kbq-skeleton-checkable control="radio" data-testid="radio" [rows]="rows.length" />
        <kbq-radio-group data-testid="real-radio">
            @for (row of rows; track row) {
                <kbq-radio-button [value]="row">Label</kbq-radio-button>
            }
        </kbq-radio-group>

        <kbq-skeleton-checkable control="toggle" data-testid="toggle" hint />
        <kbq-toggle data-testid="real-toggle">
            Label
            <kbq-hint>Hint</kbq-hint>
        </kbq-toggle>

        <kbq-skeleton-tabs data-testid="tabs" />
        <kbq-tab-group data-testid="real-tabs">
            @for (row of rows; track row) {
                <kbq-tab label="Tab">Content</kbq-tab>
            }
        </kbq-tab-group>

        <kbq-skeleton-tabs data-testid="vertical-tabs" vertical />
        <kbq-tab-group data-testid="real-vertical-tabs" vertical>
            @for (row of rows; track row) {
                <kbq-tab label="Tab">Content</kbq-tab>
            }
        </kbq-tab-group>

        <kbq-skeleton-tree data-testid="tree" />
        <kbq-tree-selection data-testid="real-tree" [dataSource]="dataSource" [treeControl]="treeControl">
            <kbq-tree-option *kbqTreeNodeDef="let node" kbqTreeNodePadding>
                <kbq-tree-node-toggle [node]="node" />
                {{ node.name }}
            </kbq-tree-option>
        </kbq-tree-selection>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
            width: 600px;
            padding: 16px;
        }

        :host > * {
            align-self: stretch;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSkeletonComponentPresets'
    }
})
export class E2eSkeletonComponentPresets {
    protected readonly rows = [1, 2, 3];
    protected readonly treeControl = new FlatTreeControl<E2eSkeletonTreeFlatNode>(
        (node) => node.level,
        (node) => node.expandable,
        (node) => node.name,
        (node) => node.name
    );
    protected readonly dataSource = new KbqTreeFlatDataSource(
        this.treeControl,
        new KbqTreeFlattener<E2eSkeletonTreeNode, E2eSkeletonTreeFlatNode>(
            (node, level) => ({ name: node.name, level, expandable: !!node.children }),
            (node) => node.level,
            (node) => node.expandable,
            (node) => node.children
        )
    );

    constructor() {
        this.dataSource.data = E2E_SKELETON_TREE;

        const expanded = this.treeControl.dataNodes.find(({ name }) => name === 'Node 2');

        if (expanded) {
            this.treeControl.expand(expanded);
        }
    }
}

/** A cell per preset, for the screenshot. */
@Component({
    selector: 'e2e-skeleton-preset-list',
    imports: [
        KbqSkeletonButton,
        KbqSkeletonBadge,
        KbqSkeletonTag,
        KbqSkeletonIcon,
        KbqSkeletonLink,
        KbqSkeletonTypography,
        KbqSkeletonDl,
        KbqSkeletonTable,
        KbqSkeletonGroup,
        KbqSkeletonFormField,
        KbqSkeletonAccordion,
        KbqSkeletonCheckable,
        KbqSkeletonTabs,
        KbqSkeletonTree
    ],
    template: `
        <kbq-skeleton-button />
        <kbq-skeleton-badge />
        <kbq-skeleton-tag />
        <kbq-skeleton-icon />
        <kbq-skeleton-link />
        <kbq-skeleton-group preset="tag" />
        <kbq-skeleton-typography level="title" />
        <kbq-skeleton-typography [lines]="3" />
        <kbq-skeleton-dl [rows]="2" />
        <kbq-skeleton-table [rows]="2" />
        <kbq-skeleton-table selectable [pinnedColumns]="1" [rows]="2" />
        <kbq-skeleton-form-field hint />
        <kbq-skeleton-form-field horizontal hint labelClass="flex-30" contentClass="flex-70" />
        <kbq-skeleton-form-field control="textarea" />
        <kbq-skeleton-accordion [rows]="2" />
        <kbq-skeleton-checkable hint />
        <kbq-skeleton-checkable control="radio" [rows]="2" />
        <kbq-skeleton-checkable control="toggle" />
        <kbq-skeleton-tabs [contentLines]="2" />
        <kbq-skeleton-tabs vertical [contentLines]="2" />
        <kbq-skeleton-tree [children]="2" [rows]="2" />
    `,
    styles: `
        :host {
            display: inline-grid;
            grid-template-columns: repeat(3, 320px);
            align-items: start;
            justify-items: start;
            gap: 24px;
            padding: 16px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSkeletonPresetList'
    }
})
export class E2eSkeletonPresetList {}
