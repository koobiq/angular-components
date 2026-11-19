import { Dir } from '@angular/cdk/bidi';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqInputSlider } from './input-slider';
import { KbqSlider } from './slider';
import type { KbqSliderCollision, KbqSliderCommit, KbqSliderValue } from './slider.types';

@Component({
    selector: 'e2e-slider-state-and-style',
    imports: [KbqSlider, KbqInputSlider],
    template: `
        <main data-testid="e2eScreenshotTarget" class="e2e-slider-matrix">
            @for (state of states; track state) {
                <div>{{ state }}</div>
                <kbq-slider
                    aria-label="Value"
                    [value]="30"
                    [disabled]="state === 'Disabled'"
                    [readonly]="state === 'Read-only'"
                    [invalid]="state === 'Invalid'"
                />
                <kbq-slider
                    [thumbLabels]="['Lower', 'Upper']"
                    [value]="[25, 75]"
                    [disabled]="state === 'Disabled'"
                    [readonly]="state === 'Read-only'"
                    [invalid]="state === 'Invalid'"
                />
            }
            <div>Marks</div>
            <kbq-slider aria-label="Value" [value]="50" [marks]="marks" />
            <kbq-slider aria-label="Value" class="e2e-slider-round" [value]="50" [marks]="marks" />
            <div>Input</div>
            <kbq-input-slider aria-label="Value" [value]="70" />
            <kbq-input-slider [value]="[25, 75]" [thumbLabels]="['Lower', 'Upper']" />
            <div>Vertical</div>
            <kbq-slider vertical aria-label="Value" [value]="30" />
            <kbq-slider vertical [value]="[25, 75]" [thumbLabels]="['Lower', 'Upper']" />
        </main>
    `,
    styles: `
        .e2e-slider-matrix {
            display: grid;
            grid-template-columns: 100px 320px 320px;
            gap: 24px;
            padding: 24px;
            align-items: center;
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
    protected readonly states = ['Normal', 'Invalid', 'Disabled', 'Read-only'];
    protected readonly marks = [0, 25, 50, 75, 100].map((value) => ({ value, label: `${value}%` }));
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
        </main>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: { 'data-testid': 'e2eSliderInteraction' }
})
export class E2eSliderInteraction {
    protected readonly direction = signal<'ltr' | 'rtl'>('ltr');
    protected readonly value = signal<KbqSliderValue>(30);
    protected readonly commits = signal<KbqSliderCommit[]>([]);
    protected readonly collision = signal<KbqSliderCollision>('none');
    protected readonly control = new FormControl<KbqSliderValue>(35, { nonNullable: true });
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
