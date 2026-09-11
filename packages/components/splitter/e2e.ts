import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqSplitter, KbqSplitterAppearance, KbqSplitterPanel } from './splitter';

const HOST_STYLES = `
    :host {
        display: block;
        padding: var(--kbq-size-s);
    }

    kbq-splitter {
        width: 600px;
        height: 200px;
        border: 1px solid var(--kbq-line-contrast-less);
    }
`;

@Component({
    selector: 'e2e-splitter-constraints',
    imports: [KbqSplitter, KbqSplitterPanel],
    template: `
        <kbq-splitter [disabled]="disabled()">
            <kbq-splitter-panel data-testid="e2eSplitterPanelFirst" [maxSize]="400" [minSize]="100">
                first
            </kbq-splitter-panel>
            <kbq-splitter-panel data-testid="e2eSplitterPanelSecond" [minSize]="150">second</kbq-splitter-panel>
        </kbq-splitter>
    `,
    styles: HOST_STYLES,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSplitterConstraints'
    }
})
export class E2eSplitterConstraints {
    readonly disabled = signal(false);
}

@Component({
    selector: 'e2e-splitter-collapsible',
    imports: [KbqSplitter, KbqSplitterPanel],
    template: `
        <kbq-splitter>
            <kbq-splitter-panel collapsible data-testid="e2eSplitterPanelFirst" [collapsedSize]="40" [minSize]="160">
                first
            </kbq-splitter-panel>
            <kbq-splitter-panel data-testid="e2eSplitterPanelSecond">second</kbq-splitter-panel>
        </kbq-splitter>
    `,
    styles: HOST_STYLES,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSplitterCollapsible'
    }
})
export class E2eSplitterCollapsible {}

@Component({
    selector: 'e2e-splitter-snap',
    imports: [KbqSplitter, KbqSplitterPanel],
    template: `
        <kbq-splitter>
            <kbq-splitter-panel data-testid="e2eSplitterPanelFirst" [snapSizes]="[200, 400]">first</kbq-splitter-panel>
            <kbq-splitter-panel data-testid="e2eSplitterPanelSecond">second</kbq-splitter-panel>
        </kbq-splitter>
    `,
    styles: HOST_STYLES,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSplitterSnap'
    }
})
export class E2eSplitterSnap {}

@Component({
    selector: 'e2e-splitter-vertical',
    imports: [KbqSplitter, KbqSplitterPanel],
    template: `
        <kbq-splitter orientation="vertical">
            <kbq-splitter-panel data-testid="e2eSplitterPanelFirst" [minSize]="50">first</kbq-splitter-panel>
            <kbq-splitter-panel data-testid="e2eSplitterPanelSecond" [minSize]="50">second</kbq-splitter-panel>
        </kbq-splitter>
    `,
    styles: HOST_STYLES,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSplitterVertical'
    }
})
export class E2eSplitterVertical {}

@Component({
    selector: 'e2e-splitter-appearance',
    imports: [KbqSplitter, KbqSplitterPanel],
    template: `
        <kbq-splitter [appearance]="appearance()">
            <kbq-splitter-panel data-testid="e2eSplitterPanelFirst">first</kbq-splitter-panel>
            <kbq-splitter-panel data-testid="e2eSplitterPanelSecond">second</kbq-splitter-panel>
        </kbq-splitter>
    `,
    styles: HOST_STYLES,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSplitterAppearance'
    }
})
export class E2eSplitterAppearance {
    readonly appearance = signal<KbqSplitterAppearance>('transparent');
}

@Component({
    selector: 'e2e-splitter-disabled',
    imports: [KbqSplitter, KbqSplitterPanel],
    template: `
        <kbq-splitter disabled>
            <kbq-splitter-panel data-testid="e2eSplitterPanelFirst">first</kbq-splitter-panel>
            <kbq-splitter-panel data-testid="e2eSplitterPanelSecond">second</kbq-splitter-panel>
        </kbq-splitter>
    `,
    styles: HOST_STYLES,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSplitterDisabled'
    }
})
export class E2eSplitterDisabled {}

@Component({
    selector: 'e2e-splitter-capped-neighbour',
    imports: [KbqSplitter, KbqSplitterPanel],
    template: `
        <kbq-splitter>
            <kbq-splitter-panel data-testid="e2eSplitterPanelFirst">first</kbq-splitter-panel>
            <kbq-splitter-panel data-testid="e2eSplitterPanelSecond" [maxSize]="200" [minSize]="125">
                second
            </kbq-splitter-panel>
            <kbq-splitter-panel data-testid="e2eSplitterPanelThird" [minSize]="125">third</kbq-splitter-panel>
        </kbq-splitter>
    `,
    styles: HOST_STYLES,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSplitterCappedNeighbour'
    }
})
export class E2eSplitterCappedNeighbour {}

@Component({
    selector: 'e2e-splitter-snap-tolerance',
    imports: [KbqSplitter, KbqSplitterPanel],
    template: `
        <kbq-splitter>
            <kbq-splitter-panel data-testid="e2eSplitterPanelFirst">first</kbq-splitter-panel>
            <kbq-splitter-panel data-testid="e2eSplitterPanelSecond" [snapSizes]="[200, 400]" [snapTolerance]="150">
                second
            </kbq-splitter-panel>
        </kbq-splitter>
    `,
    styles: HOST_STYLES,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSplitterSnapTolerance'
    }
})
export class E2eSplitterSnapTolerance {}

@Component({
    selector: 'e2e-splitter-nested-collapsed',
    imports: [KbqSplitter, KbqSplitterPanel],
    template: `
        <kbq-splitter>
            <kbq-splitter-panel data-testid="e2eSplitterPanelFirst" [minSize]="100">first</kbq-splitter-panel>
            <kbq-splitter-panel data-testid="e2eSplitterPanelHost">
                <kbq-splitter orientation="vertical">
                    <kbq-splitter-panel data-testid="e2eSplitterPanelSecond" [minSize]="50">editor</kbq-splitter-panel>
                    <kbq-splitter-panel collapsible [collapsed]="true" [minSize]="50">terminal</kbq-splitter-panel>
                </kbq-splitter>
            </kbq-splitter-panel>
        </kbq-splitter>
    `,
    // `HOST_STYLES` would size the nested splitter too, pushing it out of the panel it sits in.
    styles: `
        ${HOST_STYLES}

        kbq-splitter kbq-splitter {
            width: auto;
            height: 100%;
            border: none;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSplitterNestedCollapsed'
    }
})
export class E2eSplitterNestedCollapsed {}

@Component({
    selector: 'e2e-splitter-nested-flex',
    imports: [KbqSplitter, KbqSplitterPanel],
    template: `
        <kbq-splitter>
            <kbq-splitter-panel data-testid="e2eSplitterPanelFirst" [minSize]="100">first</kbq-splitter-panel>
            <kbq-splitter-panel>
                <kbq-splitter data-testid="e2eSplitterNested" orientation="vertical">
                    <kbq-splitter-panel [minSize]="50">editor</kbq-splitter-panel>
                    <kbq-splitter-panel
                        collapsible
                        collapsedSize="20"
                        data-testid="e2eSplitterPanelSecond"
                        size="80"
                        [minSize]="60"
                    >
                        <div>terminal</div>
                        <div>taller than its collapsed strip</div>
                    </kbq-splitter-panel>
                </kbq-splitter>
            </kbq-splitter-panel>
        </kbq-splitter>
    `,
    // The nested splitter fills its panel rather than taking a size of its own, which is what makes it a flex
    // item whose height an automatic minimum could stretch.
    styles: `
        ${HOST_STYLES}

        kbq-splitter kbq-splitter {
            flex: 1;
            width: auto;
            height: auto;
            border: none;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSplitterNestedFlex'
    }
})
export class E2eSplitterNestedFlex {}

@Component({
    selector: 'e2e-splitter-nested-cross-axis',
    imports: [KbqSplitter, KbqSplitterPanel],
    template: `
        <kbq-splitter disabled orientation="vertical">
            <kbq-splitter-panel size="140">
                <kbq-splitter data-testid="e2eSplitterNested">
                    <kbq-splitter-panel data-testid="e2eSplitterPanelFirst" [minSize]="50">first</kbq-splitter-panel>
                    <kbq-splitter-panel data-testid="e2eSplitterPanelSecond" [minSize]="50">second</kbq-splitter-panel>
                </kbq-splitter>
            </kbq-splitter-panel>
            <kbq-splitter-panel [minSize]="50">bottom</kbq-splitter-panel>
        </kbq-splitter>
    `,
    styles: `
        ${HOST_STYLES}

        kbq-splitter kbq-splitter {
            flex: 1;
            width: auto;
            height: auto;
            border: none;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSplitterNestedCrossAxis'
    }
})
export class E2eSplitterNestedCrossAxis {}

@Component({
    selector: 'e2e-splitter-percent-sizes',
    imports: [KbqSplitter, KbqSplitterPanel],
    template: `
        <kbq-splitter>
            <kbq-splitter-panel
                data-testid="e2eSplitterPanelFirst"
                maxSize="50%"
                minSize="10%"
                size="25%"
                [snapSizes]="['40%']"
            >
                first
            </kbq-splitter-panel>
            <kbq-splitter-panel data-testid="e2eSplitterPanelSecond">second</kbq-splitter-panel>
        </kbq-splitter>
    `,
    // No border, so the content box is exactly 600px and every percentage lands on a whole pixel.
    styles: `
        ${HOST_STYLES}

        kbq-splitter {
            border: none;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSplitterPercentSizes'
    }
})
export class E2eSplitterPercentSizes {}

@Component({
    selector: 'e2e-splitter-unsatisfiable-minimums',
    imports: [KbqSplitter, KbqSplitterPanel],
    template: `
        <kbq-splitter>
            <kbq-splitter-panel data-testid="e2eSplitterPanelFirst" [minSize]="250">first</kbq-splitter-panel>
            <kbq-splitter-panel data-testid="e2eSplitterPanelSecond" [minSize]="250">second</kbq-splitter-panel>
            <kbq-splitter-panel data-testid="e2eSplitterPanelThird" [minSize]="250">third</kbq-splitter-panel>
        </kbq-splitter>
    `,
    styles: HOST_STYLES,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSplitterUnsatisfiableMinimums'
    }
})
export class E2eSplitterUnsatisfiableMinimums {}
