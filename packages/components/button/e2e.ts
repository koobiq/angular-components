import { afterNextRender, ChangeDetectionStrategy, Component, inject, Injector, model, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KBQ_WINDOW, KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { combineLatest } from 'rxjs';

type DevButtonState = Partial<{
    title: string;
    disabled: boolean;
    hover: boolean;
    active: boolean;
    focused?: boolean;
    progress: boolean;
}>;

type DevButtonStyle = Partial<{
    style: KbqButtonStyles;
    color: KbqComponentColors;
}>;

type DevButton = DevButtonState & DevButtonStyle;

@Component({
    selector: 'e2e-button-state-and-style',
    imports: [KbqButtonModule, KbqIconModule, FormsModule, KbqCheckboxModule],
    template: `
        <div class="dev-options">
            <kbq-checkbox data-testid="e2eShowPrefixIcon" [(ngModel)]="showPrefixIcon">show prefix icon</kbq-checkbox>
            <kbq-checkbox
                data-testid="e2eShowTitle"
                [disabled]="!showPrefixIcon() && !showSuffixIcon()"
                [(ngModel)]="showTitle"
            >
                show title
            </kbq-checkbox>
            <kbq-checkbox data-testid="e2eShowSuffixIcon" [(ngModel)]="showSuffixIcon">show suffix icon</kbq-checkbox>
        </div>

        <table data-testid="e2eScreenshotTarget">
            @for (buttons of rows; track buttons) {
                <tr>
                    @for (button of buttons; track button.title) {
                        <td>
                            <button
                                kbq-button
                                [class.cdk-keyboard-focused]="button.focused"
                                [class.kbq-active]="button.active"
                                [class.kbq-hover]="button.hover"
                                [class.kbq-progress]="button.progress"
                                [disabled]="button.disabled"
                                [kbqStyle]="button.style!"
                                [color]="button.color!"
                            >
                                @if (showPrefixIcon()) {
                                    <i kbq-icon="kbq-play_16"></i>
                                }
                                @if (showTitle()) {
                                    {{ button.title }}
                                }
                                @if (showSuffixIcon()) {
                                    <i kbq-icon="kbq-chevron-down-s_16"></i>
                                }
                            </button>
                        </td>
                    }
                </tr>
            }
        </table>
    `,
    styles: `
        .dev-options {
            display: flex;
            gap: var(--kbq-size-m);
            margin-bottom: var(--kbq-size-l);
            padding: var(--kbq-size-xxs);
        }

        table {
            border-spacing: 0;
        }

        td {
            padding: var(--kbq-size-xxs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eButtonStateAndStyle'
    }
})
export class E2eButtonStateAndStyle {
    readonly showPrefixIcon = model(false);
    readonly showTitle = model(true);
    readonly showSuffixIcon = model(false);

    private readonly states: DevButtonState[] = [
        { title: 'disabled', disabled: true },
        { title: 'normal' },
        { title: 'hover', hover: true },
        { title: 'active', active: true },
        { title: 'focus', focused: true },
        { title: 'progress', progress: true }
    ];

    private readonly styles: DevButtonStyle[] = [
        {},
        { color: KbqComponentColors.Contrast },
        { color: KbqComponentColors.ThemeFade, style: KbqButtonStyles.Outline },
        { style: KbqButtonStyles.Outline },
        { color: KbqComponentColors.Theme, style: KbqButtonStyles.Transparent },
        { color: KbqComponentColors.Contrast, style: KbqButtonStyles.Transparent }
    ];

    readonly rows: DevButton[][] = this.styles.map((style) => this.states.map((state) => ({ ...state, ...style })));

    constructor() {
        combineLatest([toObservable(this.showPrefixIcon), toObservable(this.showSuffixIcon)])
            .pipe(takeUntilDestroyed())
            .subscribe((args) => {
                if (args.every((a) => a === false)) this.showTitle.set(true);
            });
    }
}

@Component({
    selector: 'e2e-button-group',
    imports: [KbqButtonModule, KbqIconModule],
    template: `
        <table data-testid="e2eScreenshotTarget">
            <tr>
                <td>
                    <div class="layout-row layout-gap-xl layout-align-space-between">
                        <div kbq-button-group>
                            @for (item of data; track item) {
                                <button kbq-button>
                                    {{ item }}
                                </button>
                            }
                        </div>

                        <div kbq-button-group>
                            @for (item of data; track item) {
                                <button kbq-button aria-label="Diamond icon">
                                    <i kbq-icon="kbq-diamond_16"></i>
                                </button>
                            }
                        </div>
                    </div>
                </td>
            </tr>
            @for (style of buttonStyles; track style) {
                <tr>
                    <td>
                        <div class="layout-row layout-gap-xl layout-align-space-between">
                            <div kbq-button-group [color]="style.color" [kbqStyle]="style.appearance">
                                @for (item of data; track item) {
                                    <button kbq-button>
                                        {{ item }}
                                    </button>
                                }
                            </div>

                            <div kbq-button-group [color]="style.color" [kbqStyle]="style.appearance">
                                @for (item of data; track item) {
                                    <button kbq-button aria-label="Diamond icon">
                                        <i kbq-icon="kbq-diamond_16"></i>
                                    </button>
                                }
                            </div>
                        </div>
                    </td>
                </tr>
            }
            <tr>
                <td>
                    <div kbq-button-group [kbqStyle]="style" [color]="color">
                        <button kbq-button>
                            <i kbq-icon="kbq-diamond_16"></i>
                            {{ data[0] }}
                        </button>

                        <button kbq-button>
                            {{ data[1] }}
                            <i kbq-icon="kbq-chevron-down-s_16"></i>
                        </button>

                        <button kbq-button>
                            {{ data[2] }}
                        </button>

                        <button kbq-button>
                            <i kbq-icon="kbq-ellipsis-vertical_16"></i>
                        </button>
                    </div>
                </td>
            </tr>
            <tr>
                <td>
                    <div class="layout-row layout-align-center-center layout-gap-xl">
                        @for (style of buttonStyles; track style) {
                            <div
                                kbq-button-group
                                [orientation]="'vertical'"
                                [color]="style.color"
                                [kbqStyle]="style.appearance"
                            >
                                <button kbq-button aria-label="Plus">
                                    <i kbq-icon="kbq-plus_16"></i>
                                </button>
                                <button kbq-button aria-label="Minus">
                                    <i kbq-icon="kbq-minus_16"></i>
                                </button>
                            </div>
                        }
                    </div>
                </td>
            </tr>
        </table>
    `,
    styles: `
        table {
            border-spacing: 0;
        }

        td {
            padding: var(--kbq-size-xxs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eButtonGroup'
    }
})
export class E2eButtonGroup {
    protected readonly data = [
        'Archive',
        'Report',
        'Snooze'
    ] as const;

    protected readonly buttonStyles: { color: KbqComponentColors; appearance: KbqButtonStyles }[] = [
        { color: KbqComponentColors.Contrast, appearance: KbqButtonStyles.Filled },
        { color: KbqComponentColors.ContrastFade, appearance: KbqButtonStyles.Filled },
        { color: KbqComponentColors.ThemeFade, appearance: KbqButtonStyles.Outline },
        { color: KbqComponentColors.ContrastFade, appearance: KbqButtonStyles.Outline },
        { color: KbqComponentColors.Theme, appearance: KbqButtonStyles.Transparent },
        { color: KbqComponentColors.Contrast, appearance: KbqButtonStyles.Transparent }
    ];

    protected readonly color = KbqComponentColors.ContrastFade;
    protected readonly style = KbqButtonStyles.Filled;
}

/**
 * Renders a configurable batch of icon buttons and reports how long the create + styling pass took.
 * The original implementation recursed through a MutationObserver feedback loop and, at ~1200+ buttons,
 * overflowed the call stack and left the last-rendered buttons unstyled.
 * The Playwright test triggers `run()` and asserts the
 * whole batch renders without an uncaught error and that the last button still gets `kbq-button-icon`.
 */
@Component({
    selector: 'e2e-button-stress',
    imports: [KbqButtonModule, KbqIconModule],
    template: `
        <div class="dev-options">
            <label>
                Count:
                <input
                    type="number"
                    min="0"
                    step="100"
                    data-testid="e2eButtonStressCount"
                    [value]="count()"
                    (input)="onCountInput($event)"
                />
            </label>
            <button kbq-button data-testid="e2eButtonStressRun" (click)="run()">Render</button>
            <button kbq-button data-testid="e2eButtonStressClear" [kbqStyle]="styles.Outline" (click)="clear()">
                Clear
            </button>

            @if (renderMs() !== null) {
                <span data-testid="e2eButtonStressResult">
                    Rendered
                    <b>{{ rendered() }}</b>
                    icon buttons in
                    <b>{{ renderMs() }} ms</b>
                </span>
            }
        </div>

        <div data-testid="e2eButtonStressTarget">
            @for (index of items(); track index) {
                <button kbq-button aria-label="Play">
                    <i kbq-icon="kbq-play_16"></i>
                </button>
            }
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eButtonStress'
    }
})
export class E2eButtonStress {
    private readonly injector = inject(Injector);
    private readonly window = inject(KBQ_WINDOW);

    protected readonly styles = KbqButtonStyles;

    protected readonly count = signal(1500);
    protected readonly items = signal<number[]>([]);
    protected readonly rendered = signal(0);
    protected readonly renderMs = signal<number | null>(null);

    protected onCountInput(event: Event): void {
        const next = Number.parseInt((event.currentTarget as HTMLInputElement).value, 10);

        this.count.set(Number.isFinite(next) ? Math.min(100_000, Math.max(0, next)) : 0);
    }

    protected run(): void {
        const count = this.count();

        // Start from a clean slate so the measurement covers creating the buttons from scratch.
        this.items.set([]);

        afterNextRender(
            () => {
                const start = this.window.performance.now();

                this.items.set(Array.from({ length: count }, (_, index) => index));

                // Fires after Angular has created the buttons and run the synchronous styling
                // (KbqButtonCssStyler effect) for this batch.
                afterNextRender(
                    () => {
                        this.rendered.set(count);
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
