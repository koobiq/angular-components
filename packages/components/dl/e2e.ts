import { afterNextRender, ChangeDetectionStrategy, Component } from '@angular/core';
import { kbqInjectNativeElement } from '@koobiq/components/core';
import { KbqDd, KbqDl, KbqDt } from './dl';

@Component({
    selector: 'e2e-dl-states',
    imports: [KbqDl, KbqDt, KbqDd],
    template: `
        <div class="e2e-dl-states" data-testid="e2eScreenshotTarget">
            <!-- Horizontal -->
            <kbq-dl [vertical]="false">
                <kbq-dt>Term</kbq-dt>
                <kbq-dd>Description</kbq-dd>
                <kbq-dt>Term that wraps onto two lines</kbq-dt>
                <kbq-dd>Description that is long enough to wrap onto the next line</kbq-dd>
                <kbq-dt>Hash</kbq-dt>
                <kbq-dd>5cfeaa7084b508d0ea762d8cfed396b6029eed6005d381b16e725755ec801014</kbq-dd>
            </kbq-dl>

            <!-- Wide -->
            <kbq-dl wide [vertical]="false">
                <kbq-dt>Term</kbq-dt>
                <kbq-dd>Description</kbq-dd>
                <kbq-dt>Term that wraps onto two lines</kbq-dt>
                <kbq-dd>Description that is long enough to wrap onto the next line</kbq-dd>
                <kbq-dt>Hash</kbq-dt>
                <kbq-dd>5cfeaa7084b508d0ea762d8cfed396b6029eed6005d381b16e725755ec801014</kbq-dd>
            </kbq-dl>

            <!-- Fixed term width -->
            <kbq-dl [dtWidth]="160" [vertical]="false">
                <kbq-dt>Term</kbq-dt>
                <kbq-dd>Description</kbq-dd>
                <kbq-dt>Term that wraps onto two lines</kbq-dt>
                <kbq-dd>Description that is long enough to wrap onto the next line</kbq-dd>
                <kbq-dt>Hash</kbq-dt>
                <kbq-dd>5cfeaa7084b508d0ea762d8cfed396b6029eed6005d381b16e725755ec801014</kbq-dd>
            </kbq-dl>

            <!-- Vertical -->
            <kbq-dl [vertical]="true">
                <kbq-dt>Term</kbq-dt>
                <kbq-dd>Description</kbq-dd>
                <kbq-dt>Term that wraps onto two lines</kbq-dt>
                <kbq-dd>Description that is long enough to wrap onto the next line</kbq-dd>
                <kbq-dt>Hash</kbq-dt>
                <kbq-dd>5cfeaa7084b508d0ea762d8cfed396b6029eed6005d381b16e725755ec801014</kbq-dd>
            </kbq-dl>
        </div>
    `,
    styles: `
        .e2e-dl-states {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-xl);
            width: 480px;
            padding: var(--kbq-size-s);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eDlStates'
    }
})
export class E2eDlStates {}

type DlResizerState = 'default' | 'list-hover' | 'hover' | 'focus' | 'active';

/** Classes that put a separator into each state without a pointer or a keyboard behind it. */
const e2eDlResizerStateClasses: Record<DlResizerState, { list: string[]; separator: string[] }> = {
    default: { list: [], separator: [] },
    'list-hover': { list: ['kbq-hover'], separator: [] },
    hover: { list: ['kbq-hover'], separator: ['kbq-hover'] },
    focus: { list: [], separator: ['cdk-keyboard-focused'] },
    active: { list: ['kbq-hover'], separator: ['kbq-hover', 'kbq-active'] }
};

@Component({
    selector: 'e2e-dl-resizer-states',
    imports: [KbqDl, KbqDt, KbqDd],
    template: `
        <div class="e2e-dl-resizer-states" data-testid="e2eScreenshotTarget">
            @for (state of states; track state) {
                <kbq-dl resizable [attr.data-e2e-resizer-state]="state" [vertical]="false">
                    <kbq-dt>Term</kbq-dt>
                    <kbq-dd>Description</kbq-dd>
                    <kbq-dt>Term</kbq-dt>
                    <kbq-dd>Description</kbq-dd>
                </kbq-dl>
            }
        </div>
    `,
    styles: `
        .e2e-dl-resizer-states {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-xl);
            width: 320px;
            padding: var(--kbq-size-s);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eDlResizerStates'
    }
})
export class E2eDlResizerStates {
    protected readonly states = Object.keys(e2eDlResizerStateClasses) as DlResizerState[];

    private readonly nativeElement = kbqInjectNativeElement();

    constructor() {
        afterNextRender(() => {
            for (const list of this.nativeElement.querySelectorAll<HTMLElement>('[data-e2e-resizer-state]')) {
                const separator = list.querySelector('.kbq-dl__resize-handle');
                const state = list.dataset['e2eResizerState'] as DlResizerState;

                // Throws rather than dropping the state quietly, which would rewrite the baseline without it.
                if (!separator) throw new Error(`[e2eDlResizerStates] no separator to put into the ${state} state`);

                list.classList.add(...e2eDlResizerStateClasses[state].list);
                separator.classList.add(...e2eDlResizerStateClasses[state].separator);
            }
        });
    }
}

@Component({
    selector: 'e2e-dl-resizable',
    imports: [KbqDl, KbqDt, KbqDd],
    template: `
        <div data-testid="e2eDlResizableConfigured">
            <kbq-dl resizable [dtMinWidth]="120" [ddMinWidth]="160">
                <kbq-dt>Incident type</kbq-dt>
                <kbq-dd>Malware infection</kbq-dd>
                <kbq-dt>Identifier</kbq-dt>
                <kbq-dd>INC-2026-125-78253</kbq-dd>
                <kbq-dt>Description</kbq-dt>
                <kbq-dd>A long description that keeps the second column filled while the first one is resized.</kbq-dd>
            </kbq-dl>
        </div>

        <div data-testid="e2eDlResizableAuto">
            <kbq-dl resizable>
                <kbq-dt>Incident type</kbq-dt>
                <kbq-dd>Malware infection</kbq-dd>
                <kbq-dt>Identifier</kbq-dt>
                <kbq-dd>INC-2026-125-78253</kbq-dd>
                <kbq-dt>Description</kbq-dt>
                <kbq-dd>A long description that keeps the second column filled while the first one is resized.</kbq-dd>
            </kbq-dl>
        </div>
    `,
    styles: `
        :host {
            display: block;
            width: 600px;
            padding: var(--kbq-size-m);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eDlResizable'
    }
})
export class E2eDlResizable {}
