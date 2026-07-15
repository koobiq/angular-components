import {
    afterNextRender,
    ChangeDetectionStrategy,
    Component,
    inject,
    Injector,
    signal,
    ViewEncapsulation
} from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KBQ_WINDOW, KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTitleModule } from '@koobiq/components/title';
import { ButtonExamplesModule } from 'packages/docs-examples/components/button';

@Component({
    selector: 'dev-button-stress-benchmark',
    imports: [KbqButtonModule, KbqIconModule],
    template: `
        <h4>Icon button render benchmark</h4>

        <label>
            Count:
            <input type="number" min="0" step="100" [value]="count()" (input)="onCountInput($event)" />
        </label>
        <button kbq-button (click)="run()">Render</button>
        <button kbq-button [kbqStyle]="styles.Outline" (click)="clear()">Clear</button>

        @if (renderMs() !== null) {
            <p>
                Rendered
                <b>{{ rendered() }}</b>
                icon buttons in
                <b>{{ renderMs() }} ms</b>
            </p>
        }

        <div class="dev-stress-list layout-gap-xxs layout-margin-top-s layout-row" style="flex-wrap: wrap;">
            @for (i of items(); track i) {
                <button kbq-button [color]="colors.Contrast">
                    <i kbq-icon="kbq-plus_16"></i>
                    Button {{ i }}
                </button>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevButtonStressBenchmark {
    private readonly injector = inject(Injector);

    readonly colors = KbqComponentColors;
    readonly styles = KbqButtonStyles;

    protected readonly count = signal(1200);
    protected readonly items = signal<number[]>([]);
    protected readonly rendered = signal(0);
    protected readonly renderMs = signal<number | null>(null);
    private readonly window = inject(KBQ_WINDOW);

    protected onCountInput(event: Event): void {
        this.count.set(Math.max(0, +(event.target as HTMLInputElement).value || 0));
    }

    protected run(): void {
        const n = this.count();

        // Start from a clean slate so the measurement covers creating the buttons from scratch.
        this.items.set([]);

        afterNextRender(
            () => {
                const start = this.window.performance.now();

                this.items.set(Array.from({ length: n }, (_, i) => i));

                // Fires after Angular has created the buttons and run the synchronous styling
                // (KbqButtonCssStyler effect) for this batch.
                afterNextRender(
                    () => {
                        this.rendered.set(n);
                        this.renderMs.set(+(this.window.performance.now() - start).toFixed(1));
                    },
                    { injector: this.injector }
                );
            },
            { injector: this.injector }
        );
    }

    protected clear(): void {
        this.items.set([]);
        this.rendered.set(0);
        this.renderMs.set(null);
    }
}

@Component({
    selector: 'dev-examples',
    imports: [ButtonExamplesModule],
    template: `
        <button-overview-example />
        <hr />
        <button-group-overview-example />
        <hr />
        <button-group-style-example />
        <hr />
        <button-group-content-example />
        <hr />
        <button-group-custom-content-example />
        <hr />
        <button-group-vertical-example />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevDocsExamples {}

@Component({
    selector: 'dev-app',
    imports: [KbqButtonModule, KbqIconModule, DevDocsExamples, KbqTitleModule, DevButtonStressBenchmark],
    templateUrl: 'template.html',
    styleUrls: ['styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp {
    readonly colors = KbqComponentColors;
    readonly styles = KbqButtonStyles;
}
