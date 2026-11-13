import { afterNextRender, ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { type ErrorStateMatcher, KbqComponentColors, kbqInjectNativeElement } from '@koobiq/components/core';
import { KbqError, KbqHint } from '@koobiq/components/form-field';

@Component({
    selector: 'e2e-checkbox-state-and-style',
    imports: [KbqCheckboxModule],
    template: `
        @for (type of types; track type) {
            <div>
                @for (state of states; track state) {
                    @for (color of colors; track color) {
                        <kbq-checkbox
                            [checked]="type === 'checked'"
                            [color]="color"
                            [disabled]="state === 'disabled'"
                            [class.kbq-hover]="state === 'hovered'"
                            [class.cdk-keyboard-focused]="state === 'focused'"
                            [indeterminate]="type === 'indeterminate'"
                        />
                    }
                }
            </div>
        }
    `,
    styles: `
        :host {
            display: inline-flex;
            flex-direction: column;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eCheckboxStateAndStyle'
    }
})
export class E2eCheckboxStateAndStyle {
    readonly states = ['normal', 'hovered', 'focused', 'disabled'] as const;
    readonly colors = [KbqComponentColors.Theme, KbqComponentColors.Error];
    readonly types = ['default', 'checked', 'indeterminate'] as const;
}

@Component({
    selector: 'e2e-checkbox-with-label',
    imports: [KbqCheckboxModule],
    template: `
        <div class="e2e-grids" data-testid="e2eScreenshotTarget">
            @for (big of sizes; track big) {
                <div class="e2e-grid">
                    @for (state of states; track state) {
                        @for (labelPosition of labelPositions; track labelPosition) {
                            <kbq-checkbox [big]="big" [disabled]="state === 'disabled'" [labelPosition]="labelPosition">
                                Text
                            </kbq-checkbox>
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
        'data-testid': 'e2eCheckboxWithLabel'
    }
})
export class E2eCheckboxWithLabel {
    // Each size gets a grid of its own: a big checkbox is taller than a normal one, so the two in one row never line up.
    protected readonly sizes = [false, true] as const;
    protected readonly states = ['normal', 'disabled'] as const;
    protected readonly labelPositions = ['after', 'before'] as const;
}

@Component({
    selector: 'e2e-checkbox-with-hint',
    imports: [KbqCheckboxModule, KbqHint],
    template: `
        <div class="e2e-grids" data-testid="e2eScreenshotTarget">
            @for (big of sizes; track big) {
                <div class="e2e-grid">
                    @for (state of states; track state) {
                        @for (labelPosition of labelPositions; track labelPosition) {
                            <kbq-checkbox
                                [big]="big"
                                [color]="state === 'error' ? colors.Error : colors.Theme"
                                [disabled]="state === 'disabled'"
                                [labelPosition]="labelPosition"
                            >
                                Text
                                <kbq-hint>Hint</kbq-hint>
                            </kbq-checkbox>
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
        'data-testid': 'e2eCheckboxWithHint'
    }
})
export class E2eCheckboxWithHint {
    // Each size gets a grid of its own: a big checkbox is taller than a normal one, so the two in one row never line up.
    protected readonly sizes = [false, true] as const;
    // The error palette has a hint color of its own, so it gets a row of its own.
    protected readonly states = ['normal', 'error', 'disabled'] as const;
    protected readonly labelPositions = ['after', 'before'] as const;
    protected readonly colors = KbqComponentColors;
}

@Component({
    selector: 'e2e-checkbox-height',
    imports: [KbqCheckboxModule, FormsModule],
    template: `
        <input type="checkbox" data-testid="e2eBigToggle" [(ngModel)]="big" />

        <div data-testid="e2eCheckboxWithoutLabel"><kbq-checkbox [big]="big()" /></div>
        <div data-testid="e2eCheckboxWithLabel"><kbq-checkbox [big]="big()">Label</kbq-checkbox></div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eCheckboxHeight'
    }
})
export class E2eCheckboxHeight {
    readonly big = model(false);
}

@Component({
    selector: 'e2e-checkbox-validation',
    imports: [KbqCheckboxModule, ReactiveFormsModule, KbqHint, KbqError],
    template: `
        <div class="e2e-grids" data-testid="e2eScreenshotTarget">
            <div class="e2e-grid">
                @for (type of types; track type) {
                    @for (state of states; track state) {
                        <kbq-checkbox
                            [errorStateMatcher]="errorStateMatcher"
                            [formControl]="type === 'checked' ? checked : unchecked"
                            [indeterminate]="type === 'indeterminate'"
                            [class.e2e-focused]="state === 'focused'"
                            [class.kbq-hover]="state === 'hovered'"
                        />
                    }
                }
            </div>

            @for (big of sizes; track big) {
                <div class="e2e-grid e2e-grid_content">
                    @for (content of contents; track content) {
                        @for (labelPosition of labelPositions; track labelPosition) {
                            <kbq-checkbox
                                [big]="big"
                                [errorStateMatcher]="errorStateMatcher"
                                [formControl]="unchecked"
                                [labelPosition]="labelPosition"
                                [class.e2e-narrow]="content === 'long'"
                            >
                                @if (content === 'long') {
                                    Text that is long enough to wrap onto the next line
                                } @else {
                                    Text
                                }
                                @if (content === 'hint') {
                                    <kbq-hint>Caption</kbq-hint>
                                }
                                @if (content === 'long') {
                                    <kbq-error>Error that is long enough to wrap onto the next line</kbq-error>
                                } @else if (content !== 'without-error') {
                                    <kbq-error>Error</kbq-error>
                                }
                            </kbq-checkbox>
                        }
                    }
                </div>
            }
        </div>

        <!-- Without a projected error the checkbox has to take the same space as a valid one. -->
        <kbq-checkbox data-testid="e2eCheckboxValidWithLabel" [formControl]="unchecked">Text</kbq-checkbox>
        <kbq-checkbox
            data-testid="e2eCheckboxInvalidWithLabel"
            [errorStateMatcher]="errorStateMatcher"
            [formControl]="unchecked"
        >
            Text
        </kbq-checkbox>
        <kbq-checkbox data-testid="e2eCheckboxValidWithoutLabel" [formControl]="unchecked" />
        <kbq-checkbox
            data-testid="e2eCheckboxInvalidWithoutLabel"
            [errorStateMatcher]="errorStateMatcher"
            [formControl]="unchecked"
        />
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
        'data-testid': 'e2eCheckboxValidation'
    }
})
export class E2eCheckboxValidation {
    readonly types = ['unchecked', 'checked', 'indeterminate'] as const;
    readonly states = ['normal', 'hovered', 'focused'] as const;
    readonly contents = ['error', 'hint', 'long', 'without-error'] as const;
    readonly sizes = [false, true] as const;
    readonly labelPositions = ['after', 'before'] as const;

    // Always in the error state, so the screenshot does not depend on touching or submitting.
    readonly errorStateMatcher: ErrorStateMatcher = { isErrorState: () => true };
    readonly unchecked = new FormControl(false);
    readonly checked = new FormControl(true);

    constructor() {
        const nativeElement = kbqInjectNativeElement();

        // The focus ring is drawn off the native input, which a host class does not reach.
        afterNextRender(() =>
            nativeElement
                .querySelectorAll('.e2e-focused input')
                .forEach((input) => input.classList.add('cdk-keyboard-focused'))
        );
    }
}
