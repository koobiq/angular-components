import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqIconModule } from '@koobiq/components/icon';
import { combineLatest } from 'rxjs';

const E2E_BUTTON_STATES: E2eButtonState[] = [
    { title: 'disabled', disabled: true },
    { title: 'checked', checked: true },
    { title: 'normal' },
    { title: 'hover', hover: true },
    { title: 'active', active: true },
    { title: 'focus', focused: true },
    { title: 'progress', progress: true }
];

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
                            <kbq-button-toggle-group
                                [aria-label]="'states'"
                                [vertical]="button.vertical!"
                                [multiple]="button.multiple!"
                            >
                                <kbq-button-toggle
                                    [value]="1"
                                    [aria-label]="button.title!"
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

    private readonly states: E2eButtonState[] = E2E_BUTTON_STATES;

    private readonly orientation: E2eButtonOrientation[] = [
        { vertical: false },
        { multiple: true },
        { vertical: true },
        { vertical: true, multiple: true }
    ];

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

@Component({
    selector: 'e2e-button-toggle-states-stretched',
    imports: [KbqIconModule, FormsModule, KbqCheckboxModule, KbqButtonToggleModule],
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

        <div data-testid="e2eScreenshotTarget">
            @for (state of states; track state.title) {
                <kbq-button-toggle-group stretched [aria-label]="'states'">
                    <kbq-button-toggle
                        [value]="1"
                        [aria-label]="state.title!"
                        [checked]="state.checked!"
                        [class.cdk-keyboard-focused]="state.focused"
                        [class.kbq-active]="state.active"
                        [class.kbq-hover]="state.hover"
                        [class.kbq-progress]="state.progress"
                        [disabled]="state.disabled!"
                    >
                        <!-- the marker slots, i.e. the placement that keeps both the icons and the
                             ellipsis; the legacy default slot is covered by E2eButtonToggleStates -->
                        @if (showPrefixIcon()) {
                            <i kbqButtonPrefix kbq-icon="kbq-play_16"></i>
                        }
                        @if (showTitle()) {
                            {{ state.title }}
                        }
                        @if (showSuffixIcon()) {
                            <i kbqButtonSuffix kbq-icon="kbq-chevron-down-s_16"></i>
                        }
                    </kbq-button-toggle>
                    <kbq-button-toggle [value]="2">default 2</kbq-button-toggle>
                    <kbq-button-toggle [value]="3">default 3</kbq-button-toggle>
                </kbq-button-toggle-group>
            }
        </div>
    `,
    styles: `
        :host {
            display: block;
            width: 400px;
        }

        .dev-options {
            display: flex;
            gap: var(--kbq-size-m);
            margin-bottom: var(--kbq-size-l);
            padding: var(--kbq-size-xxs);
        }

        kbq-button-toggle-group + kbq-button-toggle-group {
            margin-top: var(--kbq-size-xxs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eButtonToggleStatesStretched'
    }
})
export class E2eButtonToggleStatesStretched {
    readonly showPrefixIcon = model(false);
    readonly showTitle = model(true);
    readonly showSuffixIcon = model(false);

    readonly states: E2eButtonState[] = E2E_BUTTON_STATES;

    constructor() {
        combineLatest([toObservable(this.showPrefixIcon), toObservable(this.showSuffixIcon)])
            .pipe(takeUntilDestroyed())
            .subscribe((args) => {
                if (args.every((a) => a === false)) this.showTitle.set(true);
            });
    }
}

/**
 * Label truncation scenarios.
 *
 * `.kbq-button-toggle-text` must stay a block container, because `text-overflow: ellipsis` is never
 * painted on a flex box — and it is also the box `kbq-title` measures, so the tooltip opens at exactly
 * the width the ellipsis appears at. That only holds while the icons are laid out *beside* it, which
 * is what the `kbqButtonPrefix`/`kbqButtonSuffix` slots are for; an icon left in the default slot
 * shares the box with the label and gives the ellipsis up, the same trade-off as `KbqButton`.
 */
@Component({
    selector: 'e2e-button-toggle-truncation',
    imports: [KbqButtonToggleModule, KbqIconModule],
    template: `
        <div data-testid="e2eScreenshotTarget">
            <!-- marker slots: the icons sit outside the truncating box, so both survive -->
            <kbq-button-toggle-group stretched>
                <kbq-button-toggle data-testid="e2eButtonToggleTruncationSlots" [value]="1">
                    <i kbqButtonPrefix kbq-icon="kbq-play_16"></i>
                    {{ label }}
                    <i kbqButtonSuffix kbq-icon="kbq-chevron-down-s_16"></i>
                </kbq-button-toggle>
            </kbq-button-toggle-group>

            <!-- the same, with the label in the consumer's own element: it is inline content of the
                 label box, so it truncates just like a bare text node -->
            <kbq-button-toggle-group stretched>
                <kbq-button-toggle data-testid="e2eButtonToggleTruncationWrappedLabel" [value]="1">
                    <i kbqButtonPrefix kbq-icon="kbq-play_16"></i>
                    <span>{{ label }}</span>
                </kbq-button-toggle>
            </kbq-button-toggle-group>

            <!-- legacy markup: the icon is projected into the default slot, i.e. into the label box,
                 which then lays its content out as a flex row — centred icon, no ellipsis -->
            <kbq-button-toggle-group stretched>
                <kbq-button-toggle data-testid="e2eButtonToggleTruncationLegacy" [value]="1">
                    <i kbq-icon="kbq-play_16"></i>
                    {{ label }}
                </kbq-button-toggle>
            </kbq-button-toggle-group>

            <!-- nothing to lay out beside the label: the plain truncating box -->
            <kbq-button-toggle-group stretched>
                <kbq-button-toggle data-testid="e2eButtonToggleTruncationLabelOnly" [value]="1">
                    {{ label }}
                </kbq-button-toggle>
            </kbq-button-toggle-group>

            <!-- a slotted icon with no label at all: the label box is empty and must not take a gap
                 of the row, or it would push the icon off centre -->
            <kbq-button-toggle-group>
                <kbq-button-toggle data-testid="e2eButtonToggleTruncationIconOnly" aria-label="Play" [value]="1">
                    <i kbqButtonPrefix kbq-icon="kbq-play_16"></i>
                </kbq-button-toggle>
            </kbq-button-toggle-group>
        </div>
    `,
    styles: `
        [data-testid='e2eScreenshotTarget'] {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: var(--kbq-size-m);
            padding: var(--kbq-size-m);

            width: 200px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eButtonToggleTruncation'
    }
})
export class E2eButtonToggleTruncation {
    protected readonly label = 'Длинный текст кнопки-переключателя';
}
