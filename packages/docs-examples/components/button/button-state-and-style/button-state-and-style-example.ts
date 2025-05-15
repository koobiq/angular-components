import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { combineLatest } from 'rxjs';

type ExampleButtonState = Partial<{
    title: string;
    disabled: boolean;
    hover: boolean;
    active: boolean;
    focused?: boolean;
    progress: boolean;
}>;

type ExampleButtonStyle = Partial<{
    style: KbqButtonStyles;
    color: KbqComponentColors;
}>;

type ExampleButton = ExampleButtonState & ExampleButtonStyle;

/** @title Button state and style */
@Component({
    standalone: true,
    imports: [KbqButtonModule, KbqIconModule, FormsModule, KbqCheckboxModule],
    selector: 'button-state-and-style-example',
    template: `
        <div class="example-options">
            <kbq-checkbox [(ngModel)]="showPrefixIcon">show prefix icon</kbq-checkbox>
            <kbq-checkbox [(ngModel)]="showTitle" [disabled]="!showPrefixIcon() && !showSuffixIcon()">
                show title
            </kbq-checkbox>
            <kbq-checkbox [(ngModel)]="showSuffixIcon">show suffix icon</kbq-checkbox>
        </div>

        <table>
            @for (buttons of rows; track buttons) {
                <tr>
                    @for (button of buttons; track button.title) {
                        <td>
                            <button
                                [class.cdk-keyboard-focused]="button.focused"
                                [class.kbq-active]="button.active"
                                [class.kbq-hover]="button.hover"
                                [class.kbq-progress]="button.progress"
                                [disabled]="button.disabled"
                                [kbqStyle]="button.style!"
                                [color]="button.color!"
                                kbq-button
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
        .example-options {
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
export class ButtonStateAndStyleExample {
    readonly showPrefixIcon = model(false);
    readonly showTitle = model(true);
    readonly showSuffixIcon = model(false);

    private readonly states: ExampleButtonState[] = [
        { title: 'disabled', disabled: true },
        { title: 'normal' },
        { title: 'hover', hover: true },
        { title: 'active', active: true },
        { title: 'focus', focused: true },
        { title: 'progress', progress: true }];

    private readonly styles: ExampleButtonStyle[] = [
        {},
        { color: KbqComponentColors.Contrast },
        { color: KbqComponentColors.ThemeFade, style: KbqButtonStyles.Outline },
        { style: KbqButtonStyles.Outline },
        { color: KbqComponentColors.Theme, style: KbqButtonStyles.Transparent },
        { color: KbqComponentColors.Contrast, style: KbqButtonStyles.Transparent }];

    readonly rows: ExampleButton[][] = this.styles.map((style) => this.states.map((state) => ({ ...state, ...style })));

    constructor() {
        combineLatest([toObservable(this.showPrefixIcon), toObservable(this.showSuffixIcon)])
            .pipe(takeUntilDestroyed())
            .subscribe((args) => {
                if (args.every((a) => a === false)) this.showTitle.set(true);
            });
    }
}
