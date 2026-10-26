import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ErrorStateMatcher, KbqComponentColors } from '@koobiq/components/core';
import { KbqError, KbqHint } from '@koobiq/components/form-field';
import { KbqRadioButton, KbqRadioGroup } from './radio.component';

@Component({
    selector: 'e2e-radio-state-and-style',
    imports: [KbqRadioButton],
    template: `
        <div class="e2e-grids" data-testid="e2eScreenshotTarget">
            @for (color of colors; track color) {
                <div class="e2e-grid">
                    @for (type of types; track type) {
                        @for (state of states; track state) {
                            <kbq-radio-button
                                [checked]="type === 'checked'"
                                [color]="color"
                                [disabled]="state === 'disabled'"
                                [class.cdk-keyboard-focused]="state === 'focused'"
                                [class.kbq-hovered]="state === 'hovered'"
                            />
                        }
                    }
                </div>
            }
        </div>
    `,
    styles: `
        .e2e-grids {
            display: inline-grid;
            gap: var(--kbq-size-xl);
            justify-items: start;
            padding: var(--kbq-size-xs);
        }

        .e2e-grid {
            display: inline-grid;
            grid-template-columns: repeat(4, auto);
            gap: var(--kbq-size-s);
            align-items: start;
            justify-items: start;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eRadioStateAndStyle'
    }
})
export class E2eRadioStateAndStyle {
    // A big button draws the same circle as a normal one, so the states need no size of their own.
    protected readonly colors = [KbqComponentColors.Empty, KbqComponentColors.Error];
    protected readonly types = ['unchecked', 'checked'] as const;
    protected readonly states = ['normal', 'hovered', 'focused', 'disabled'] as const;
}

@Component({
    selector: 'e2e-radio-with-label',
    imports: [KbqRadioButton, KbqRadioGroup],
    template: `
        <div class="e2e-grids" data-testid="e2eScreenshotTarget">
            @for (big of sizes; track big) {
                <div class="e2e-grid">
                    @for (state of states; track state) {
                        @for (labelPosition of labelPositions; track labelPosition) {
                            <kbq-radio-group
                                [big]="big"
                                [disabled]="state === 'disabled'"
                                [labelPosition]="labelPosition"
                            >
                                @for (option of [0, 1]; track option) {
                                    <kbq-radio-button [checked]="$first" [value]="option">
                                        Option #{{ option }}
                                    </kbq-radio-button>
                                }
                            </kbq-radio-group>
                        }
                    }
                </div>
            }
        </div>
    `,
    styles: `
        .e2e-grids {
            display: inline-grid;
            gap: var(--kbq-size-xl);
            justify-items: start;
            padding: var(--kbq-size-xs);
        }

        .e2e-grid {
            display: inline-grid;
            grid-template-columns: repeat(2, auto);
            gap: var(--kbq-size-s);
            align-items: start;
            justify-items: start;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eRadioWithLabel'
    }
})
export class E2eRadioWithLabel {
    // Each size gets a grid of its own: a big button is taller than a normal one, so the two in one row never line up.
    protected readonly sizes = [false, true] as const;
    protected readonly states = ['normal', 'disabled'] as const;
    protected readonly labelPositions = ['after', 'before'] as const;
}

@Component({
    selector: 'e2e-radio-with-hint',
    imports: [KbqRadioButton, KbqRadioGroup, KbqHint],
    template: `
        <div class="e2e-grids" data-testid="e2eScreenshotTarget">
            @for (big of sizes; track big) {
                <div class="e2e-grid">
                    @for (state of states; track state) {
                        @for (labelPosition of labelPositions; track labelPosition) {
                            <kbq-radio-group
                                [big]="big"
                                [color]="state === 'error' ? colors.Error : colors.Empty"
                                [disabled]="state === 'disabled'"
                                [labelPosition]="labelPosition"
                            >
                                @for (option of [0, 1]; track option) {
                                    <kbq-radio-button [checked]="$first" [value]="option">
                                        Option #{{ option }}
                                        <kbq-hint>Hint #{{ option }}</kbq-hint>
                                    </kbq-radio-button>
                                }
                            </kbq-radio-group>
                        }
                    }
                </div>
            }
        </div>
    `,
    styles: `
        .e2e-grids {
            display: inline-grid;
            gap: var(--kbq-size-xl);
            justify-items: start;
            padding: var(--kbq-size-xs);
        }

        .e2e-grid {
            display: inline-grid;
            grid-template-columns: repeat(2, auto);
            gap: var(--kbq-size-s);
            align-items: start;
            justify-items: start;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eRadioWithHint'
    }
})
export class E2eRadioWithHint {
    // Each size gets a grid of its own: a big button is taller than a normal one, so the two in one row never line up.
    protected readonly sizes = [false, true] as const;
    // The error palette colors the hint too, so it gets a row of its own.
    protected readonly states = ['normal', 'error', 'disabled'] as const;
    protected readonly labelPositions = ['after', 'before'] as const;
    protected readonly colors = KbqComponentColors;
}

@Component({
    selector: 'e2e-radio-height',
    imports: [KbqRadioButton, KbqRadioGroup, FormsModule],
    template: `
        <input type="checkbox" data-testid="e2eBigToggle" [(ngModel)]="big" />

        <kbq-radio-group [big]="big()">
            <div data-testid="e2eRadioWithoutLabel"><kbq-radio-button value="without-label" /></div>
            <div data-testid="e2eRadioWithLabel"><kbq-radio-button value="with-label">Label</kbq-radio-button></div>
            <kbq-radio-button data-testid="e2eRadioWithoutWrapper" value="without-wrapper" />
        </kbq-radio-group>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eRadioHeight'
    }
})
export class E2eRadioHeight {
    readonly big = model(false);
}

@Component({
    selector: 'e2e-radio-validation',
    imports: [
        KbqRadioButton,
        KbqRadioGroup,
        ReactiveFormsModule,
        KbqHint,
        KbqError
    ],
    template: `
        <div class="e2e-grids" data-testid="e2eScreenshotTarget">
            <div class="e2e-grid">
                @for (type of types; track type) {
                    @for (state of states; track state) {
                        <kbq-radio-group
                            [errorStateMatcher]="errorStateMatcher"
                            [formControl]="type === 'selected' ? selected : unselected"
                        >
                            @for (option of [0, 1]; track option) {
                                <kbq-radio-button
                                    [value]="option"
                                    [class.cdk-keyboard-focused]="state === 'focused'"
                                    [class.kbq-hovered]="state === 'hovered'"
                                >
                                    Option #{{ option }}
                                </kbq-radio-button>
                            }
                        </kbq-radio-group>
                    }
                }
            </div>

            @for (big of sizes; track big) {
                <div class="e2e-grid e2e-grid_content">
                    @for (content of contents; track content) {
                        @for (labelPosition of labelPositions; track labelPosition) {
                            <kbq-radio-group
                                [big]="big"
                                [errorStateMatcher]="errorStateMatcher"
                                [formControl]="unselected"
                                [labelPosition]="labelPosition"
                                [class.e2e-narrow]="content === 'long'"
                            >
                                @for (option of [0, 1]; track option) {
                                    <kbq-radio-button [value]="option">
                                        @if (content === 'long') {
                                            Option #{{ option }} that is long enough to wrap onto the next line
                                        } @else {
                                            Option #{{ option }}
                                        }
                                        @if (content === 'hint') {
                                            <kbq-hint>Hint #{{ option }}</kbq-hint>
                                        }
                                    </kbq-radio-button>
                                }
                                <!-- Written before the error, which still comes first. -->
                                @if (content === 'group-hint') {
                                    <kbq-hint>Hint of the group</kbq-hint>
                                }
                                @if (content === 'long') {
                                    <kbq-error>Error that is long enough to wrap onto the next line</kbq-error>
                                } @else if (content !== 'without-error') {
                                    <kbq-error>Error</kbq-error>
                                }
                            </kbq-radio-group>
                        }
                    }
                </div>
            }
        </div>

        <!-- Without a projected error the group has to take the same space as a valid one. -->
        <kbq-radio-group aria-label="Valid" data-testid="e2eRadioValid" [formControl]="unselected">
            <kbq-radio-button [value]="0">Option #0</kbq-radio-button>
        </kbq-radio-group>
        <kbq-radio-group
            aria-label="Invalid"
            data-testid="e2eRadioInvalid"
            [errorStateMatcher]="errorStateMatcher"
            [formControl]="unselected"
        >
            <kbq-radio-button [value]="0">Option #0</kbq-radio-button>
        </kbq-radio-group>
    `,
    styles: `
        :host {
            display: inline-flex;
            flex-direction: column;
            align-items: flex-start;
        }

        .e2e-grids {
            display: inline-grid;
            gap: var(--kbq-size-xl);
            justify-items: start;
            padding: var(--kbq-size-xs);
        }

        .e2e-grid {
            display: inline-grid;
            grid-template-columns: repeat(3, auto);
            gap: var(--kbq-size-s);
            align-items: start;
            justify-items: start;
        }

        .e2e-grid_content {
            grid-template-columns: repeat(2, auto);
        }

        .e2e-narrow {
            max-width: 160px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eRadioValidation'
    }
})
export class E2eRadioValidation {
    readonly types = ['unselected', 'selected'] as const;
    readonly states = ['normal', 'hovered', 'focused'] as const;
    readonly contents = ['error', 'hint', 'group-hint', 'long', 'without-error'] as const;
    readonly sizes = [false, true] as const;
    readonly labelPositions = ['after', 'before'] as const;

    // Always in the error state, so the screenshot does not depend on touching or submitting.
    readonly errorStateMatcher: ErrorStateMatcher = { isErrorState: () => true };
    readonly unselected = new FormControl<number | null>(null);
    readonly selected = new FormControl<number | null>(0);
}
