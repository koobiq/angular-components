import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqComponentColors } from '@koobiq/components/core';
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
    style: KbqButtonStyles;
    color: KbqComponentColors;
}>;

type DevButton = DevButtonState & DevButtonStyle;

@Component({
    standalone: true,
    imports: [KbqButtonModule, KbqIconModule, FormsModule, KbqCheckboxModule, KbqSplitButtonModule],
    selector: 'dev-split-button-state-and-style',
    host: {
        'data-testid': 'e2eSplitButtonStateAndStyle'
    },
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
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevSplitButtonStateAndStyle {
    readonly showPrefixIcon = model(false);
    readonly showTitle = model(true);

    private readonly states: DevButtonState[] = [
        { title: 'disabled', disabled: true },
        { title: 'disabledSecond', disabledSecond: true },
        { title: 'normal' },
        { title: 'hover', hover: true },
        { title: 'hoverSecond', hoverSecond: true },
        { title: 'active', active: true },
        { title: 'activeSecond', activeSecond: true },
        { title: 'focus', focused: true },
        { title: 'focusSecond', focusedSecond: true },
        { title: 'progress', progress: true },
        { title: 'progressSecond', progressSecond: true },
        { title: 'progressAll', progress: true, progressSecond: true }];

    private readonly styles: DevButtonStyle[] = [
        {},
        { color: KbqComponentColors.Contrast },
        { color: KbqComponentColors.ThemeFade, style: KbqButtonStyles.Outline },
        { color: KbqComponentColors.ContrastFade, style: KbqButtonStyles.Outline },
        { color: KbqComponentColors.Theme, style: KbqButtonStyles.Transparent },
        { color: KbqComponentColors.Contrast, style: KbqButtonStyles.Transparent }];

    readonly rows: DevButton[][] = this.styles.map((style) => this.states.map((state) => ({ ...state, ...style })));

    constructor() {
        combineLatest([toObservable(this.showPrefixIcon)])
            .pipe(takeUntilDestroyed())
            .subscribe((args) => {
                if (args.every((a) => a === false)) this.showTitle.set(true);
            });
    }
}
