import { Dir } from '@angular/cdk/bidi';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqInputSlider } from './input-slider';
import { KbqSlider } from './slider';
import type { KbqSliderCollision, KbqSliderCommit, KbqSliderFill, KbqSliderValue } from './slider.types';

@Component({
    selector: 'e2e-slider-state-and-style',
    imports: [Dir, KbqSlider, KbqInputSlider],
    template: `
        <section data-testid="states">
            <div data-testid="e2eScreenshotTarget">
                @for (state of states; track state) {
                    @for (value of selections; track value) {
                        <kbq-slider
                            aria-label="Value"
                            [value]="value"
                            [disabled]="state === 'disabled'"
                            [readonly]="state === 'readonly'"
                            [errorStateMatcher]="state === 'invalid' ? invalidMatcher : undefined"
                        />
                    }
                }
            </div>
        </section>
        <section data-testid="input">
            <div data-testid="e2eScreenshotTarget">
                @for (state of states; track state) {
                    @for (value of selections; track value) {
                        <kbq-input-slider
                            aria-label="Value"
                            [value]="value"
                            [disabled]="state === 'disabled'"
                            [readonly]="state === 'readonly'"
                            [errorStateMatcher]="state === 'invalid' ? invalidMatcher : undefined"
                        />
                    }
                }
                <kbq-input-slider aria-label="Value" unit="%" [value]="70" />
                <kbq-input-slider aria-label="Value" [showStepper]="false" [value]="70" />
            </div>
        </section>
        <section data-testid="fill">
            <div data-testid="e2eScreenshotTarget" class="e2e-fills">
                @for (fill of fills; track fill) {
                    <kbq-slider
                        aria-label="Value"
                        [value]="fill === 'outside' ? [25, 75] : 30"
                        [fill]="fill"
                        [fillOrigin]="50"
                    />
                }
            </div>
        </section>
        <section data-testid="marks-and-thumbs">
            <div data-testid="e2eScreenshotTarget" class="e2e-marks-and-thumbs">
                <kbq-slider aria-label="Value" [value]="50" [marks]="ticks" />
                <kbq-slider aria-label="Value" [value]="50" [marks]="marks" />
                <kbq-slider aria-label="Value" [value]="50" />
                <kbq-slider class="e2e-slider-round" aria-label="Value" [value]="50" />
                <kbq-slider aria-label="Value" [value]="[0, 100]" />
                <kbq-slider thumbAlignment="center" aria-label="Value" [value]="[0, 100]" />
            </div>
        </section>
        <section data-testid="direction">
            <div data-testid="e2eScreenshotTarget" class="e2e-direction">
                <div class="e2e-horizontal">
                    <kbq-slider aria-label="Value" [value]="30" />
                    <div dir="rtl">
                        <kbq-slider aria-label="Value" [value]="30" />
                    </div>
                    <kbq-slider reversed aria-label="Value" [value]="30" />
                </div>
                <kbq-slider vertical aria-label="Value" [value]="30" />
                <kbq-slider vertical aria-label="Value" [value]="[25, 75]" />
            </div>
        </section>
        <section data-testid="focus-and-tooltip">
            <div data-testid="e2eScreenshotTarget" class="e2e-tooltip">
                <kbq-slider aria-label="Value" [value]="30" />
                <kbq-slider showTooltip aria-label="Value" [value]="30" />
            </div>
        </section>
    `,
    styles: `
        [data-testid='e2eScreenshotTarget'] {
            display: inline-grid;
            grid-template-columns: repeat(2, auto);
            align-items: center;
            gap: var(--kbq-size-m) var(--kbq-size-3xl);
            padding: var(--kbq-size-m) var(--kbq-size-xl);
        }
        kbq-slider:not(.kbq-slider_vertical),
        kbq-input-slider {
            width: 200px;
        }
        .e2e-fills {
            grid-template-columns: auto;
        }
        .e2e-marks-and-thumbs {
            align-items: start;
        }
        .e2e-direction {
            grid-template-columns: repeat(3, auto);
        }
        .e2e-horizontal {
            display: grid;
            gap: var(--kbq-size-m);
        }
        .e2e-tooltip {
            padding-top: 48px;
        }
        .e2e-slider-round {
            --kbq-slider-thumb-width: 16px;
            --kbq-slider-thumb-height: 16px;
            --kbq-slider-thumb-radius: 50%;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { 'data-testid': 'e2eSliderStateAndStyle' }
})
export class E2eSliderStateAndStyle {
    protected readonly invalidMatcher = { isErrorState: () => true };
    protected readonly states = ['normal', 'invalid', 'disabled', 'readonly'];
    protected readonly selections = [30, [25, 75]] as const;
    protected readonly fills: readonly KbqSliderFill[] = ['start', 'end', 'origin', 'outside', 'none'];
    protected readonly ticks = [0, 25, 50, 75, 100].map((value) => ({ value }));
    protected readonly marks = this.ticks.map(({ value }) => ({ value, label: `${value}%` }));
}

@Component({
    selector: 'e2e-slider-interaction',
    imports: [KbqSlider, KbqInputSlider, ReactiveFormsModule, Dir],
    template: `
        <main style="width: 400px; padding: 40px; display: flex; flex-direction: column; gap: 24px">
            <kbq-slider
                data-testid="single"
                showTooltip
                aria-label="Volume"
                name="volume"
                [(value)]="value"
                (valueCommit)="commits.update(addCommit($event))"
            />
            <output data-testid="value">{{ value() }}</output>
            <output data-testid="commits">{{ commits().length }}</output>
            <kbq-slider
                data-testid="range"
                [attr.data-collision]="collision()"
                [value]="[25, 75]"
                [minDistance]="10"
                [collision]="collision()"
                [thumbLabels]="['Lower price', 'Upper price']"
            />
            <button type="button" (click)="collision.set('push')">Push</button>
            <button type="button" (click)="collision.set('swap')">Swap</button>
            <kbq-slider
                data-testid="coincident"
                [value]="[50, 50]"
                [thumbLabels]="['Coincident lower', 'Coincident upper']"
            />
            <kbq-slider data-testid="vertical" vertical aria-label="Vertical" [value]="30" />
            <div [dir]="direction()"><kbq-slider data-testid="direction" aria-label="Direction" [value]="30" /></div>
            <button type="button" (click)="direction.set('rtl')">RTL</button>
            <kbq-slider data-testid="readonly" readonly aria-label="Read only" [value]="30" />
            <kbq-slider data-testid="disabled" disabled aria-label="Disabled" [value]="30" />
            <kbq-slider data-testid="marks" aria-label="Marks" [step]="null" [marks]="marks" [value]="15" />
            <kbq-slider data-testid="reactive" aria-label="Reactive" [formControl]="control" />
            <button type="button" (click)="control.reset()">Reset</button>
            <kbq-input-slider data-testid="hybrid" aria-label="Hybrid" [value]="70" />
            <kbq-input-slider
                data-testid="hybrid-range"
                [value]="[25, 75]"
                [thumbLabels]="['Minimum input', 'Maximum input']"
            />
            <iframe
                title="External frame"
                srcdoc="<button>External content</button>"
                style="width: 400px; height: 120px"
            ></iframe>
            <form data-testid="native-form">
                <kbq-slider data-testid="native-slider" name="amount" aria-label="Amount" [value]="70" />
                <kbq-input-slider data-testid="native-editor" name="limit" aria-label="Limit" [(value)]="nativeValue" />
                <button type="reset">Reset native</button>
                <output data-testid="native-value">{{ nativeValue() }}</output>
            </form>
            <kbq-input-slider
                data-testid="hybrid-reactive"
                aria-label="Reactive editor"
                [formControl]="editorControl"
            />
            <button type="button" (click)="editorControl.reset(editorControl.value)">Reset current</button>
            <button type="button" (click)="editorControl.setValue(42)">Write 42</button>
            <kbq-input-slider data-testid="hybrid-marks" aria-label="Discrete" [step]="null" [marks]="marks" />
            <kbq-slider data-testid="range-tooltip" showTooltip [value]="[25, 75]" />
        </main>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { 'data-testid': 'e2eSliderInteraction' }
})
export class E2eSliderInteraction {
    protected readonly direction = signal<'ltr' | 'rtl'>('ltr');
    protected readonly value = signal(30);
    protected readonly commits = signal<KbqSliderCommit[]>([]);
    protected readonly collision = signal<KbqSliderCollision>('none');
    protected readonly control = new FormControl<KbqSliderValue>(35, { nonNullable: true });
    protected readonly nativeValue = signal(70);
    protected readonly editorControl = new FormControl<KbqSliderValue>(70, { nonNullable: true });
    protected readonly marks = [
        { value: 0, label: '0' },
        { value: 15, label: '15' },
        { value: 70, label: '70' },
        { value: 100, label: '100' }
    ];
    protected addCommit(event: KbqSliderCommit): (commits: KbqSliderCommit[]) => KbqSliderCommit[] {
        return (commits) => [...commits, event];
    }
}
