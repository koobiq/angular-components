import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { KbqButtonColor, KbqButtonModule, KbqButtonStyle, KbqButtonStyles } from '@koobiq/components/button';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSplitButtonModule } from '@koobiq/components/split-button';
import { combineLatest } from 'rxjs';

type DevButtonState = Partial<{
    title: string;
    disabled: boolean;
    disabledSecond: boolean;
    hover: boolean;
    hoverSecond: boolean;
    active: boolean;
    activeSecond: boolean;
    focused?: boolean;
    focusedSecond?: boolean;
    progress: boolean;
    progressSecond: boolean;
}>;

type DevButtonStyle = Partial<{
    style: KbqButtonStyle;
    color: KbqButtonColor;
}>;

type DevButton = DevButtonState & DevButtonStyle;

@Component({
    selector: 'e2e-split-button-state-and-style',
    imports: [KbqButtonModule, KbqIconModule, FormsModule, KbqCheckboxModule, KbqSplitButtonModule],
    template: `
        <div class="dev-options">
            <kbq-checkbox data-testid="e2eShowPrefixIcon" [(ngModel)]="showPrefixIcon">show prefix icon</kbq-checkbox>
            <kbq-checkbox data-testid="e2eShowTitle" [disabled]="!showPrefixIcon()" [(ngModel)]="showTitle">
                show title
            </kbq-checkbox>
        </div>

        <table data-testid="e2eScreenshotTarget">
            @for (buttons of rows; track buttons) {
                <tr>
                    @for (button of buttons; track button.title) {
                        <td>
                            <kbq-split-button [color]="button.color!" [kbqStyle]="button.style!">
                                <button
                                    kbq-button
                                    [class.cdk-keyboard-focused]="button.focused"
                                    [class.kbq-active]="button.active"
                                    [class.kbq-hover]="button.hover"
                                    [class.kbq-progress]="button.progress"
                                    [disabled]="button.disabled"
                                >
                                    @if (showPrefixIcon()) {
                                        <i kbq-icon="kbq-play_16"></i>
                                    }
                                    @if (showTitle()) {
                                        {{ button.title }}
                                    }
                                </button>
                                <button
                                    kbq-button
                                    aria-label="More options"
                                    [class.cdk-keyboard-focused]="button.focusedSecond"
                                    [class.kbq-active]="button.activeSecond"
                                    [class.kbq-hover]="button.hoverSecond"
                                    [class.kbq-progress]="button.progressSecond"
                                    [disabled]="button.disabledSecond"
                                >
                                    <i kbq-icon="kbq-chevron-down-s_16"></i>
                                </button>
                            </kbq-split-button>
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
        'data-testid': 'e2eSplitButtonStateAndStyle'
    }
})
export class E2eSplitButtonStateAndStyle {
    readonly showPrefixIcon = model(false);
    readonly showTitle = model(true);

    private readonly states: DevButtonState[] = [
        { title: 'disabled', disabled: true },
        { title: 'disabledSecond', disabledSecond: true },
        { title: 'completelyDisabled', disabledSecond: true, disabled: true },
        { title: 'normal' },
        { title: 'hover', hover: true },
        { title: 'hoverSecond', hoverSecond: true },
        { title: 'active', active: true },
        { title: 'activeSecond', activeSecond: true },
        { title: 'focus', focused: true },
        { title: 'focusSecond', focusedSecond: true },
        { title: 'progress', progress: true },
        { title: 'progressSecond', progressSecond: true },
        { title: 'progressAll', progress: true, progressSecond: true }
    ];

    private readonly styles: DevButtonStyle[] = [
        {},
        { color: KbqComponentColors.Contrast },
        { color: KbqComponentColors.ThemeFade, style: KbqButtonStyles.Outline },
        { color: KbqComponentColors.ContrastFade, style: KbqButtonStyles.Outline },
        { color: KbqComponentColors.Theme, style: KbqButtonStyles.Transparent },
        { color: KbqComponentColors.Contrast, style: KbqButtonStyles.Transparent }
    ];

    readonly rows: DevButton[][] = this.styles.map((style) => this.states.map((state) => ({ ...state, ...style })));

    constructor() {
        combineLatest([toObservable(this.showPrefixIcon)])
            .pipe(takeUntilDestroyed())
            .subscribe((args) => {
                if (args.every((a) => a === false)) this.showTitle.set(true);
            });
    }
}

/**
 * Label truncation for the leading button of a split-button.
 *
 * The leading button is a regular `kbq-button` under the hood, so it truncates exactly like one:
 * with no icon, or with an icon in `kbqButtonPrefix`, `.kbq-button-text` stays a block container and
 * the label truncates with an ellipsis. The trailing chevron button is always icon-only and isn't
 * exercised here.
 */
@Component({
    selector: 'e2e-split-button-truncation',
    imports: [KbqSplitButtonModule, KbqButtonModule, KbqIconModule],
    template: `
        <div data-testid="e2eScreenshotTarget">
            <div class="narrow">
                <kbq-split-button data-testid="e2eSplitButtonTruncationNoIcon">
                    <button kbq-button>{{ label }}</button>
                    <button kbq-button>
                        <i kbq-icon="kbq-chevron-down-s_16"></i>
                    </button>
                </kbq-split-button>
            </div>

            <div class="narrow">
                <kbq-split-button data-testid="e2eSplitButtonTruncationPrefixIcon">
                    <button kbq-button>
                        <i kbqButtonPrefix kbq-icon="kbq-plus_16"></i>
                        {{ label }}
                    </button>
                    <button kbq-button>
                        <i kbq-icon="kbq-chevron-down-s_16"></i>
                    </button>
                </kbq-split-button>
            </div>
        </div>
    `,
    styles: `
        [data-testid='e2eScreenshotTarget'] {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-m);
            padding: var(--kbq-size-m);
        }

        .narrow {
            width: 180px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSplitButtonTruncation'
    }
})
export class E2eSplitButtonTruncation {
    protected readonly label = 'Очень длинный текст кнопки, который не помещается';
}

/**
 * Split button whose trailing button opens a real menu.
 *
 * An element screenshot only captures what overlaps the element box, so the target is sized to hold
 * the open panel whole. The control is given a width above the 200px default `panelMinWidth`, so that
 * `panelAutoWidth` is what sizes the panel; the panel is then anchored to the chevron rather than to
 * the control, which is why the target has to fit the leading button plus a full 240px panel, and be
 * tall enough for the panel to unfold below.
 */
@Component({
    selector: 'e2e-split-button-dropdown',
    imports: [KbqSplitButtonModule, KbqButtonModule, KbqIconModule, KbqDropdownModule],
    template: `
        <div data-testid="e2eScreenshotTarget">
            <kbq-split-button [panelAutoWidth]="true">
                <button kbq-button>Save</button>
                <button
                    kbq-button
                    aria-label="More options"
                    data-testid="e2eSplitButtonDropdownTrigger"
                    [kbqDropdownTriggerFor]="dropdown"
                >
                    <i kbq-icon="kbq-chevron-down-s_16"></i>
                </button>
            </kbq-split-button>

            <kbq-dropdown #dropdown="kbqDropdown">
                <button kbq-dropdown-item>Save as</button>
                <button kbq-dropdown-item>Save a copy</button>
                <button disabled kbq-dropdown-item>Save all</button>
            </kbq-dropdown>
        </div>
    `,
    styles: `
        [data-testid='e2eScreenshotTarget'] {
            width: 360px;
            height: 240px;
            padding: var(--kbq-size-m);
        }

        kbq-split-button {
            width: 240px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eSplitButtonDropdown'
    }
})
export class E2eSplitButtonDropdown {}
