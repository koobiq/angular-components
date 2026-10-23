import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ErrorStateMatcher, KbqComponentColors } from '@koobiq/components/core';
import { KbqError, KbqFormFieldModule, KbqHint } from '@koobiq/components/form-field';
import { KbqToggleModule } from '@koobiq/components/toggle';

@Component({
    selector: 'e2e-toggle-state-and-style',
    imports: [KbqToggleModule, FormsModule],
    template: `
        <input type="checkbox" data-testid="e2eIndeterminateToggle" [(ngModel)]="indeterminate" />
        <input type="checkbox" data-testid="e2eBigToggle" [(ngModel)]="big" />

        <table data-testid="e2eScreenshotTarget">
            <tbody>
                @for (color of colors; track color) {
                    <tr>
                        @for (state of states; track state) {
                            <td>
                                <div>
                                    @for (type of types; track type) {
                                        @let dataTestId = 'e2eToggle-' + color + '-' + state + '-' + type;
                                        <kbq-toggle
                                            [attr.data-testid]="dataTestId"
                                            [color]="color"
                                            [disabled]="state === 'disabled'"
                                            [indeterminate]="indeterminate()"
                                            [class.kbq-hovered]="state === 'hovered'"
                                            [class.cdk-keyboard-focused]="state === 'focused'"
                                            [checked]="type === 'checked'"
                                            [loading]="state === 'loading'"
                                            [big]="big()"
                                        />
                                    }
                                </div>
                            </td>
                        }
                    </tr>
                }
            </tbody>
        </table>
    `,
    styles: `
        td {
            padding: var(--kbq-size-xs);
            width: 1px;
        }

        div {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-xxs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eToggleStateAndStyle'
    }
})
export class E2eToggleStateAndStyle {
    readonly states = ['normal', 'hovered', 'focused', 'disabled', 'loading'] as const;
    readonly colors = [KbqComponentColors.Theme, KbqComponentColors.Error];
    readonly types = ['default', 'checked'] as const;

    readonly indeterminate = model(false);
    readonly big = model(false);
}

@Component({
    selector: 'e2e-toggle-with-text-and-caption',
    imports: [KbqToggleModule, KbqFormFieldModule, FormsModule],
    template: `
        <input type="checkbox" data-testid="e2eBigToggle" [(ngModel)]="big" />

        <table data-testid="e2eScreenshotTarget">
            <tbody>
                @for (state of states; track state) {
                    <tr>
                        @for (position of positions; track position) {
                            <td>
                                <div>
                                    <kbq-toggle
                                        [disabled]="state === 'disabled'"
                                        [labelPosition]="position"
                                        [big]="big()"
                                    >
                                        Text
                                        <kbq-hint>Caption</kbq-hint>
                                    </kbq-toggle>
                                </div>
                            </td>
                        }
                    </tr>
                }
            </tbody>
        </table>
    `,
    styles: `
        td {
            padding: var(--kbq-size-xs);
            width: 1px;
        }

        div {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-m);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eToggleWithTextAndCaption'
    }
})
export class E2eToggleWithTextAndCaption {
    readonly states = ['normal', 'disabled'] as const;
    readonly positions = ['left', 'right'] as const;

    readonly big = model(false);
}

@Component({
    selector: 'e2e-toggle-height',
    imports: [KbqToggleModule, FormsModule],
    template: `
        <input type="checkbox" data-testid="e2eBigToggle" [(ngModel)]="big" />

        <div data-testid="e2eToggleWithoutLabel"><kbq-toggle [big]="big()" /></div>
        <div data-testid="e2eToggleWithLabel"><kbq-toggle [big]="big()">Label</kbq-toggle></div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eToggleHeight'
    }
})
export class E2eToggleHeight {
    readonly big = model(false);
}

@Component({
    selector: 'e2e-toggle-validation',
    imports: [KbqToggleModule, ReactiveFormsModule, KbqHint, KbqError],
    template: `
        <div class="e2e-grids" data-testid="e2eScreenshotTarget">
            <div class="e2e-grid">
                @for (type of types; track type) {
                    @for (state of states; track state) {
                        <kbq-toggle
                            [errorStateMatcher]="errorStateMatcher"
                            [formControl]="type === 'checked' ? checked : unchecked"
                            [indeterminate]="type === 'indeterminate'"
                            [class.cdk-keyboard-focused]="state === 'focused'"
                            [class.kbq-hovered]="state === 'hovered'"
                        />
                    }
                }
            </div>

            @for (big of sizes; track big) {
                <div class="e2e-grid e2e-grid_content">
                    @for (content of contents; track content) {
                        @for (labelPosition of labelPositions; track labelPosition) {
                            <kbq-toggle
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
                            </kbq-toggle>
                        }
                    }
                </div>
            }
        </div>

        <!-- Without a projected error the toggle has to take the same space as a valid one. -->
        <kbq-toggle data-testid="e2eToggleValidWithLabel" [formControl]="unchecked">Text</kbq-toggle>
        <kbq-toggle
            data-testid="e2eToggleInvalidWithLabel"
            [errorStateMatcher]="errorStateMatcher"
            [formControl]="unchecked"
        >
            Text
        </kbq-toggle>
        <kbq-toggle data-testid="e2eToggleValidWithoutLabel" [formControl]="unchecked" />
        <kbq-toggle
            data-testid="e2eToggleInvalidWithoutLabel"
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
        'data-testid': 'e2eToggleValidation'
    }
})
export class E2eToggleValidation {
    readonly types = ['unchecked', 'checked', 'indeterminate'] as const;
    readonly states = ['normal', 'hovered', 'focused'] as const;
    readonly contents = ['error', 'hint', 'long', 'without-error'] as const;
    readonly sizes = [false, true] as const;
    readonly labelPositions = ['right', 'left'] as const;

    // Always in the error state, so the screenshot does not depend on touching or submitting.
    readonly errorStateMatcher: ErrorStateMatcher = { isErrorState: () => true };
    readonly unchecked = new FormControl(false);
    readonly checked = new FormControl(true);
}
