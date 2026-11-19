import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTitleModule } from '@koobiq/components/title';
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
 * Label truncation scenarios.
 *
 * `.kbq-button-text` must stay a block container, because `text-overflow: ellipsis` is never painted
 * on a flex box, and the host carries `max-width: 100%` so a hug-width button clamps to its container
 * instead of growing past it (`white-space: nowrap` makes the label's min-content contribution its
 * full width). Icons must keep their size and stay vertically centred in all three placements:
 * the `kbqButtonPrefix`/`kbqButtonSuffix` slots, the legacy default slot, and icon-only buttons.
 * An icon nested deeper than a direct child (e.g. wrapped in a badge) must NOT trigger that same
 * flex fallback, or it would silently lose its ellipsis too.
 */
@Component({
    selector: 'e2e-button-truncation',
    imports: [KbqButtonModule, KbqIconModule, KbqTitleModule],
    template: `
        <div data-testid="e2eScreenshotTarget">
            <!-- hug-width button in a narrow container, with no consumer CSS whatsoever -->
            <div class="narrow">
                <button kbq-button data-testid="e2eButtonTruncationHug" [color]="colors.Contrast">{{ label }}</button>
            </div>

            <!-- "fixed content": the flex column stretches the button to its own width -->
            <div class="narrow column">
                <button kbq-button data-testid="e2eButtonTruncationFixed" [color]="colors.Contrast">{{ label }}</button>
            </div>

            <!-- "fill content": the button takes the full width of a wider block -->
            <div class="wide">
                <button class="fill" kbq-button data-testid="e2eButtonTruncationFill" [color]="colors.Contrast">
                    {{ label }}
                </button>
            </div>

            <!-- a short label must still hug, not stretch to the container -->
            <div class="wide">
                <button kbq-button data-testid="e2eButtonTruncationShort" [color]="colors.Contrast">ОК</button>
            </div>

            <!-- marker slots: the icons sit outside the truncating box, so both survive -->
            <div class="narrow">
                <button kbq-button data-testid="e2eButtonTruncationSlots" [color]="colors.Contrast">
                    <i kbqButtonPrefix kbq-icon="kbq-plus_16"></i>
                    {{ label }}
                    <i kbqButtonSuffix kbq-icon="kbq-chevron-down-s_16"></i>
                </button>
            </div>

            <!-- legacy markup: the icon is projected into the default slot, i.e. inside .kbq-button-text -->
            <div class="narrow">
                <button kbq-button data-testid="e2eButtonTruncationLegacy" [color]="colors.Contrast">
                    <i kbq-icon="kbq-plus_16"></i>
                    {{ label }}
                </button>
            </div>

            <!-- icon-only: the icon is the whole content of the default slot -->
            <div class="narrow">
                <button
                    kbq-button
                    aria-label="Plus"
                    data-testid="e2eButtonTruncationIconOnly"
                    [color]="colors.Contrast"
                >
                    <i kbq-icon="kbq-plus_16"></i>
                </button>
            </div>

            <!-- kbq-title surfaces the full label once it is clipped -->
            <div class="narrow">
                <button kbq-button kbq-title data-testid="e2eButtonTruncationTitle" [color]="colors.Contrast">
                    {{ label }}
                </button>
            </div>
        </div>

        <!-- an icon nested inside a wrapper (e.g. a badge) is a descendant but not a direct child of
             .kbq-button-text — unlike the legacy case above, this must stay a block container. Kept
             outside e2eScreenshotTarget so it doesn't perturb the 05-light/dark.png baseline above. -->
        <div class="narrow">
            <button kbq-button data-testid="e2eButtonTruncationNestedIcon" [color]="colors.Contrast">
                <span class="marker"><i kbq-icon="kbq-plus_16"></i></span>
                {{ label }}
            </button>
        </div>

        <!-- the same nesting, but with no text alongside it — the shape KbqButtonToggle projects.
             No selector can match this without also matching the case above, so the label box is
             told by KbqButtonCssStyler rather than by CSS. -->
        <div class="narrow">
            <button
                kbq-button
                aria-label="Plus"
                data-testid="e2eButtonTruncationWrappedIconOnly"
                [color]="colors.Contrast"
            >
                <span class="wrapper"><i kbq-icon="kbq-plus_16"></i></span>
            </button>
        </div>

        <!-- a marker directive on a lone icon must be a no-op: it has no label to space itself from -->
        <div class="narrow">
            <button
                kbq-button
                aria-label="Plus"
                data-testid="e2eButtonTruncationIconOnlyWithMarker"
                [color]="colors.Contrast"
            >
                <i kbqButtonPrefix kbq-icon="kbq-plus_16"></i>
            </button>
        </div>

        <!-- an icon button has no label to truncate, so a container narrower than the button must not
             shrink it and clip the icon -->
        <div class="squeezed">
            <button
                kbq-button
                aria-label="Plus"
                data-testid="e2eButtonTruncationIconOnlySqueezed"
                [color]="colors.Contrast"
            >
                <i kbq-icon="kbq-plus_16"></i>
            </button>
        </div>
    `,
    styles: `
        [data-testid='e2eScreenshotTarget'] {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-m);
            padding: var(--kbq-size-m);

            /* hug the widest row: as a plain block the target stretches to the page width, and the
               baseline would capture ~940px of empty space beside the 260px rows */
            width: fit-content;
        }

        .narrow {
            width: 150px;
        }

        /* narrower than the 32px an icon button occupies */
        .squeezed {
            width: 20px;
        }

        /* a component that wraps content before projecting it centres inside its own box, exactly
           as KbqButtonToggle does — the button can only centre the wrapper itself */
        .wrapper {
            display: flex;
            align-items: center;
        }

        .wide {
            width: 260px;
        }

        .column {
            display: flex;
            flex-direction: column;
        }

        .fill {
            width: 100%;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eButtonTruncation'
    }
})
export class E2eButtonTruncation {
    protected readonly colors = KbqComponentColors;
    protected readonly label = 'Очень длинный текст кнопки, который не помещается';
}
