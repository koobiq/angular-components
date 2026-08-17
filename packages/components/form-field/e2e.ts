import { ChangeDetectionStrategy, Component, signal, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqTagsModule } from '@koobiq/components/tags';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { KbqTimepickerModule } from '@koobiq/components/timepicker';

@Component({
    selector: 'e2e-form-field-group',
    imports: [KbqInputModule, KbqButtonModule, KbqIconModule],
    template: `
        <div data-testid="e2eHorizontalTarget" style="max-width: 300px">
            <div class="kbq-group">
                <kbq-form-field class="kbq-group-item">
                    <input kbqInput placeholder="text" type="text" />
                </kbq-form-field>

                <kbq-form-field class="kbq-group-item">
                    <input kbqInput placeholder="text" type="text" />
                </kbq-form-field>

                <kbq-form-field class="kbq-group-item">
                    <input kbqInput placeholder="text" type="text" />
                </kbq-form-field>

                <button kbq-button class="kbq-group-item" aria-label="Dropdown">
                    <i kbq-icon="kbq-chevron-down-s_16"></i>
                </button>
            </div>
        </div>

        <div data-testid="e2eVerticalTarget" style="max-width: 100px">
            <div class="kbq-vertical-group">
                <kbq-form-field class="kbq-group-item">
                    <input kbqInput placeholder="text" type="text" />
                </kbq-form-field>

                <kbq-form-field class="kbq-group-item">
                    <input kbqInput placeholder="text" type="text" />
                </kbq-form-field>

                <kbq-form-field class="kbq-group-item">
                    <input kbqInput placeholder="text" type="text" />
                </kbq-form-field>

                <button kbq-button class="kbq-group-item">
                    <i kbq-icon="kbq-floppy-disk_16"></i>
                    Save
                </button>
            </div>
        </div>
    `,
    styleUrls: ['../core/styles/common/_groups.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        'data-testid': 'e2eFormFieldGroup'
    }
})
export class E2eFormFieldGroup {}

@Component({
    selector: 'e2e-form-fieldset',
    imports: [KbqInputModule, KbqButtonModule, KbqIconModule],
    template: `
        <div data-testid="e2eScreenshotTarget">
            <kbq-fieldset>
                <legend kbqLegend>
                    A long field name that wraps to a new line and is positioned even above the button.
                </legend>

                <kbq-form-field kbqFieldsetItem>
                    <input kbqInput />
                </kbq-form-field>

                <button kbq-button kbqFieldsetItem kbqStyle="outline">
                    <i kbq-icon="kbq-floppy-disk_16"></i>
                    Save
                </button>

                <kbq-hint>
                    A long hint text under the field that wraps to a new line and even extends beneath the button.
                </kbq-hint>
            </kbq-fieldset>
        </div>
    `,
    styles: `
        :host {
            display: block;
            padding: var(--kbq-size-m);
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eFormFieldset'
    }
})
export class E2eFormFieldset {}

@Component({
    selector: 'e2e-form-field-addons',
    imports: [FormsModule, KbqInputModule, KbqButtonModule],
    template: `
        <kbq-form-field>
            <input data-testid="cleanerInput" kbqInput [(ngModel)]="textValue" />
            <kbq-cleaner data-testid="cleaner" ariaLabel="Clear text" />
        </kbq-form-field>

        <kbq-form-field>
            <input data-testid="passwordInput" kbqInputPassword [(ngModel)]="passwordValue" />
            <kbq-password-toggle data-testid="passwordToggle" />
        </kbq-form-field>

        <kbq-form-field>
            <input data-testid="numberInput" kbqNumberInput [(ngModel)]="numberValue" />
            @if (showStepper()) {
                <kbq-stepper data-testid="stepper" />
            }
        </kbq-form-field>

        <button data-testid="showStepper" kbq-button (click)="showStepper.set(true)">Show stepper</button>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-m);
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eFormFieldAddons'
    }
})
export class E2eFormFieldAddons {
    protected textValue = 'Koobiq';
    protected passwordValue = 'password';
    protected numberValue = 10;
    protected readonly showStepper = signal(false);
}

/** A field state the autofill matrix renders a control in. */
type AutofillState = {
    name: string;
    /** `FocusMonitor` writes this in real use; the matrix needs it without stealing focus. */
    focused?: boolean;
    /** The second branch of the same selector in `form-field.scss`, which has to be covered too. */
    kbqFocused?: boolean;
    error?: boolean;
    disabled?: boolean;
    noBorders?: boolean;
    inOverlay?: boolean;
};

/**
 * Everything a browser could put a value into, plus `select`, which it cannot.
 *
 * No `datepicker`: it carries `.kbq-input` exactly as `timepicker` does, so it would add a duplicate
 * column, and a `KbqDatepicker` throws when a second input is bound to it — which a matrix rendering
 * the same control in more than one state necessarily does. The spec asserts its class membership
 * instead.
 */
type AutofillControl =
    'input' | 'password' | 'number' | 'timepicker' | 'tagInput' | 'tagInputBare' | 'textarea' | 'select';

/**
 * Autofill styling, crossed two ways (#DS-4096).
 *
 * `stateMatrix` holds one plain input in every field state, and is what shows whether autofill
 * out-ranks the state the field is already in — it does, which is the bug the ticket is about.
 * `controlMatrix` holds every control the stylesheet could reach, focused and not, and is what
 * shows which of them the three autofill rule blocks actually cover: `.kbq-input` and
 * `.kbq-tag-input` get the design system's treatment, `.kbq-textarea` gets nothing and paints
 * Chrome's own opaque blue instead.
 *
 * Two grids rather than one 9x9: the interesting states are all a plain input can show, and the
 * interesting controls all differ in the default and focused states alone, so the product would be
 * mostly duplicate cells in a baseline that is expensive to review.
 */
@Component({
    selector: 'e2e-form-field-autofill',
    imports: [
        FormsModule,
        KbqInputModule,
        KbqTextareaModule,
        KbqTagsModule,
        KbqSelectModule,
        KbqTimepickerModule,
        KbqLuxonDateModule
    ],
    template: `
        <div class="e2e__grid" data-testid="e2eStateMatrix">
            @for (state of stateMatrix; track state.name) {
                <div class="e2e__row">
                    <div class="e2e__label">{{ state.name }}</div>

                    <div class="e2e__cell">
                        <!--
                            The invalid class is set from here rather than through an
                            ErrorStateMatcher: these fields carry no NgControl, so the form field's
                            own "invalid" getter is always false and a matcher would never run,
                            leaving the error rows identical to the default ones. A class binding in
                            the parent template out-ranks the component's host binding for the same
                            class, so the two cannot fight.
                        -->
                        <kbq-form-field
                            [attr.data-testid]="stateTestId(state)"
                            [class.cdk-focused]="state.focused"
                            [class.kbq-focused]="state.kbqFocused"
                            [class.kbq-form-field_invalid]="state.error"
                            [inOverlay]="!!state.inOverlay"
                            [noBorders]="!!state.noBorders"
                        >
                            <input kbqInput [attr.value]="'Input'" [disabled]="!!state.disabled" />
                        </kbq-form-field>
                    </div>
                </div>
            }
        </div>

        <!--
            Transposed relative to the state grid: controls down, states across. Eight controls in a
            row would be about 1500px wide, and a locator screenshot of something wider than the
            viewport is cropped silently rather than failing.
        -->
        <div class="e2e__grid" data-testid="e2eControlMatrix">
            @for (control of controls; track control) {
                <div class="e2e__row">
                    <div class="e2e__label">{{ control }}</div>

                    @for (state of controlMatrix; track state.name) {
                        <div class="e2e__cell">
                            <kbq-form-field
                                [attr.data-testid]="controlTestId(control, state)"
                                [class.cdk-focused]="state.focused"
                            >
                                <!--
                                    One root node per block: a control-flow block with two of them
                                    stops Angular projecting into the form field's named slots
                                    (NG8011), and a suffix would land in the wrong place — silently,
                                    in a screenshot.
                                -->
                                @switch (control) {
                                    @case ('input') {
                                        <input kbqInput [attr.value]="'Input'" />
                                    }
                                    @case ('password') {
                                        <input kbqInputPassword [attr.value]="'P@ssw0rd'" />
                                    }
                                    @case ('number') {
                                        <!--
                                            attr.value rather than value: KbqInput matches
                                            input[kbqNumberInput] as well, so both directives are
                                            on this element and both declare a "value" input, with
                                            different types. Writing the DOM attribute sidesteps the
                                            pair; the control reads the element anyway.
                                        -->
                                        <!--
                                            ngModel rather than the attribute the others use:
                                            KbqNumberInput normalises its value on init and writes
                                            the empty string back over a bare DOM attribute, which
                                            renders an empty field. Safe here because the control
                                            grid has no disabled state — an NgControl would take
                                            over the disabled flag if it did.
                                        -->
                                        <input kbqNumberInput [ngModel]="123456" />
                                    }
                                    @case ('timepicker') {
                                        <input kbqTimepicker [attr.value]="'11:12:13'" />
                                    }
                                    @case ('tagInput') {
                                        <!--
                                            The canonical shape: kbqInput next to kbqTagInputFor
                                            puts both .kbq-input and .kbq-tag-input on the
                                            element, which is why the focus-geometry block reaches
                                            it at all — through the former, not the latter.
                                        -->
                                        <kbq-tag-list #tagList>
                                            <kbq-tag>Tag</kbq-tag>
                                            <input kbqInput [attr.value]="'Tag'" [kbqTagInputFor]="tagList" />
                                        </kbq-tag-list>
                                    }
                                    @case ('tagInputBare') {
                                        <!--
                                            Synthetic, and deliberately so: dropping kbqInput
                                            leaves .kbq-tag-input alone, which is the only way to
                                            see what the focus-geometry block covers on its own.
                                        -->
                                        <kbq-tag-list #bareTagList>
                                            <kbq-tag>Tag</kbq-tag>
                                            <input [attr.value]="'Tag'" [kbqTagInputFor]="bareTagList" />
                                        </kbq-tag-list>
                                    }
                                    @case ('textarea') {
                                        <textarea kbqTextarea [canGrow]="false">Textarea</textarea>
                                    }
                                    @case ('select') {
                                        <kbq-select>
                                            <kbq-option value="one">One</kbq-option>
                                        </kbq-select>
                                    }
                                }
                            </kbq-form-field>
                        </div>
                    }
                </div>
            }
        </div>
    `,
    styles: `
        :host {
            /* No fixed height anywhere: a fixed one crops cells out of the baseline without failing. */
            .e2e__grid {
                display: inline-flex;
                flex-direction: column;
                gap: 4px;
                /* The host is a flex column, so without this the grid stretches to the full
                   viewport width and three quarters of every baseline is empty page. */
                align-self: flex-start;
            }

            .e2e__row {
                display: flex;
                gap: 4px;
                align-items: flex-start;
            }

            .e2e__label {
                display: flex;
                width: 110px;
                flex: none;
            }

            .e2e__cell {
                display: flex;
                width: 180px;
                flex: none;
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-top-l layout-margin-bottom-l layout-column',
        'data-testid': 'e2eFormFieldAutofill'
    }
})
export class E2eFormFieldAutofill {
    protected readonly controls: AutofillControl[] = [
        'input',
        'password',
        'number',
        'timepicker',
        'tagInput',
        'tagInputBare',
        'textarea',
        'select'
    ];

    protected readonly stateMatrix: AutofillState[] = [
        { name: 'default' },
        { name: 'focused', focused: true },
        { name: 'kbqFocused', kbqFocused: true },
        { name: 'error', error: true },
        { name: 'errorFocused', error: true, focused: true },
        { name: 'disabled', disabled: true },
        { name: 'noBorders', noBorders: true },
        { name: 'inOverlay', inOverlay: true }
    ];

    protected readonly controlMatrix: AutofillState[] = [{ name: 'default' }, { name: 'focused', focused: true }];

    // Built here rather than concatenated in the template: a template literal is the lint-approved
    // way to join these, and a backtick inside an inline template would close the template literal
    // the whole decorator lives in.
    protected stateTestId({ name }: AutofillState): string {
        return `state_${name}`;
    }

    protected controlTestId(control: AutofillControl, { name }: AutofillState): string {
        return `control_${control}_${name}`;
    }
}
