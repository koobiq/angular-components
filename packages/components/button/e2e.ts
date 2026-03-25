import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqComponentColors } from '@koobiq/components/core';
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
        { title: 'progress', progress: true }];

    private readonly styles: DevButtonStyle[] = [
        {},
        { color: KbqComponentColors.Contrast },
        { color: KbqComponentColors.ThemeFade, style: KbqButtonStyles.Outline },
        { style: KbqButtonStyles.Outline },
        { color: KbqComponentColors.Theme, style: KbqButtonStyles.Transparent },
        { color: KbqComponentColors.Contrast, style: KbqButtonStyles.Transparent }];

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
                    <div class="layout-gap-3xs" kbq-button-group [kbqStyle]="style" [color]="color">
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
