import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqIconModule } from '@koobiq/components/icon';
import { combineLatest } from 'rxjs';

type E2eButtonState = Partial<{
    title: string;
    disabled: boolean;
    checked: boolean;
    hover: boolean;
    active: boolean;
    focused?: boolean;
    progress: boolean;
}>;

type E2eButtonOrientation = Partial<{
    vertical: boolean;
    multiple: boolean;
}>;

type DevButton = E2eButtonState & E2eButtonOrientation;

@Component({
    selector: 'e2e-button-toggle-states',
    imports: [KbqIconModule, FormsModule, KbqCheckboxModule, KbqButtonToggleModule, KbqButtonModule],
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
                            <kbq-button-toggle-group [vertical]="button.vertical!" [multiple]="button.multiple!">
                                <kbq-button-toggle
                                    [value]="1"
                                    [checked]="button.checked!"
                                    [class.cdk-keyboard-focused]="button.focused"
                                    [class.kbq-active]="button.active"
                                    [class.kbq-hover]="button.hover"
                                    [class.kbq-progress]="button.progress"
                                    [disabled]="button.disabled!"
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
                                </kbq-button-toggle>
                                <kbq-button-toggle [value]="2" [checked]="button.multiple! && button.checked!">
                                    default 2
                                </kbq-button-toggle>
                                <kbq-button-toggle [value]="3">default 3</kbq-button-toggle>
                            </kbq-button-toggle-group>
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
        'data-testid': 'e2eButtonToggleStates'
    }
})
export class E2eButtonToggleStates {
    readonly showPrefixIcon = model(false);
    readonly showTitle = model(true);
    readonly showSuffixIcon = model(false);

    private readonly states: E2eButtonState[] = [
        { title: 'disabled', disabled: true },
        { title: 'checked', checked: true },
        { title: 'normal' },
        { title: 'hover', hover: true },
        { title: 'active', active: true },
        { title: 'focus', focused: true },
        { title: 'progress', progress: true }];

    private readonly orientation: E2eButtonOrientation[] = [
        { vertical: false },
        { multiple: true },
        { vertical: true },
        { vertical: true, multiple: true }];

    readonly rows: DevButton[][] = this.orientation.map((style) =>
        this.states.map((state) => ({ ...state, ...style }))
    );

    constructor() {
        combineLatest([toObservable(this.showPrefixIcon), toObservable(this.showSuffixIcon)])
            .pipe(takeUntilDestroyed())
            .subscribe((args) => {
                if (args.every((a) => a === false)) this.showTitle.set(true);
            });
    }
}
