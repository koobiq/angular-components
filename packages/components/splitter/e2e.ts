import { afterNextRender, ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { kbqInjectNativeElement } from '@koobiq/components/core';
import { KbqSplitter, KbqSplitterAppearance, KbqSplitterOrientation, KbqSplitterPanel } from './splitter';

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

@Component({
    selector: 'e2e-splitter-collapsible-live',
    imports: [KbqSplitter, KbqSplitterPanel],
    template: `
        <kbq-splitter>
            <kbq-splitter-panel
                collapsible
                data-testid="e2eSplitterPanelFirst"
                [collapsedSize]="40"
                [minSize]="160"
                [(collapsed)]="collapsed"
            >
                first
            </kbq-splitter-panel>
            <kbq-splitter-panel data-testid="e2eSplitterPanelSecond">second</kbq-splitter-panel>
        </kbq-splitter>
        <output data-testid="e2eSplitterCollapsedState">{{ collapsed() }}</output>
    `,
    styles: HOST_STYLES,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSplitterCollapsibleLive'
    }
})
export class E2eSplitterCollapsibleLive {
    protected readonly collapsed = signal(false);
}

@Component({
    selector: 'e2e-splitter-padded-panels',
    imports: [KbqSplitter, KbqSplitterPanel],
    template: `
        <kbq-splitter>
            <kbq-splitter-panel data-testid="e2eSplitterPanelFirst">first</kbq-splitter-panel>
            <kbq-splitter-panel data-testid="e2eSplitterPanelSecond">second</kbq-splitter-panel>
        </kbq-splitter>
    `,
    styles: [
        HOST_STYLES,
        `
            kbq-splitter-panel {
                padding: var(--kbq-size-s);
            }
        `
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSplitterPaddedPanels'
    }
})
export class E2eSplitterPaddedPanels {}

type E2eSplitterSeparatorState = 'default' | 'hover' | 'focus' | 'active';

/** Classes that put a separator into each state without a pointer or a keyboard behind it. */
const e2eSplitterSeparatorStateClasses: Record<E2eSplitterSeparatorState, string[]> = {
    default: [],
    hover: ['kbq-hover'],
    focus: ['cdk-keyboard-focused'],
    active: ['kbq-active']
};

@Component({
    selector: 'e2e-splitter-states',
    imports: [KbqSplitter, KbqSplitterPanel],
    template: `
        <div class="e2e-splitter-states" data-testid="e2eScreenshotTarget">
            @for (orientation of orientations; track orientation) {
                @for (appearance of appearances; track appearance) {
                    @for (state of states; track state) {
                        <kbq-splitter
                            class="e2e-splitter"
                            [appearance]="appearance"
                            [attr.data-e2e-separator-state]="state"
                            [class.e2e-splitter_vertical]="orientation === 'vertical'"
                            [orientation]="orientation"
                        >
                            <kbq-splitter-panel>
                                <div class="e2e-splitter-panel-content">A</div>
                            </kbq-splitter-panel>
                            <kbq-splitter-panel>
                                <div class="e2e-splitter-panel-content">B</div>
                            </kbq-splitter-panel>
                        </kbq-splitter>
                    }
                }
            }
        </div>
    `,
    styles: `
        :host {
            display: block;
        }

        .e2e-splitter-states {
            display: grid;
            grid-template-columns: repeat(4, max-content);
            gap: var(--kbq-size-s);
            width: max-content;
            padding: var(--kbq-size-s);
        }

        .e2e-splitter {
            width: 64px;
            height: 48px;
            border: 1px solid var(--kbq-line-contrast-less);
            border-radius: var(--kbq-size-border-radius);
        }

        .e2e-splitter_vertical {
            height: 64px;
        }

        .e2e-splitter-panel-content {
            flex: 1;
            align-content: center;
            text-align: center;
            user-select: none;
            color: var(--kbq-foreground-contrast-secondary);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSplitterStates'
    }
})
export class E2eSplitterStates {
    protected readonly orientations: KbqSplitterOrientation[] = ['horizontal', 'vertical'];
    protected readonly appearances: KbqSplitterAppearance[] = ['divider', 'transparent', 'handle'];
    protected readonly states = Object.keys(e2eSplitterSeparatorStateClasses) as E2eSplitterSeparatorState[];

    private readonly nativeElement = kbqInjectNativeElement();

    constructor() {
        afterNextRender(() => {
            for (const splitter of this.nativeElement.querySelectorAll<HTMLElement>('[data-e2e-separator-state]')) {
                const separator = splitter.querySelector(
                    ':scope > .kbq-splitter-panel > .kbq-splitter-panel__separator'
                );
                const state = splitter.dataset.e2eSeparatorState as E2eSplitterSeparatorState;

                // Throws rather than dropping the state quietly, which would rewrite the baseline without it.
                if (!separator) throw new Error(`[e2eSplitterStates] no separator to put into the ${state} state`);

                separator.classList.add(...e2eSplitterSeparatorStateClasses[state]);
            }
        });
    }
}
