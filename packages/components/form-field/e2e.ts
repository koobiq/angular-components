import { ChangeDetectionStrategy, Component, signal, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqTagsModule } from '@koobiq/components/tags';
import { KbqTextareaModule } from '@koobiq/components/textarea';

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

/** One row of the autofill matrix: the field state every control in that row is rendered in. */
type AutofillState = {
    name: string;
    focused?: boolean;
    error?: boolean;
    disabled?: boolean;
    inOverlay?: boolean;
    noBorders?: boolean;
    /**
     * Fakes `kbq-form-field_autofilled`, the class `AutofillMonitor` adds once it sees the fill. Every
     * other row is driven through the real `:autofill` pseudo-class by the spec; this row is the only
     * cover the TypeScript-driven arm gets, because a forced pseudo-class writes no value and fires no
     * `animationstart`, so the monitor never reacts to it.
     */
    monitored?: boolean;
};

/** The controls a browser can autofill inside a form field. */
type AutofillControl = 'input' | 'password' | 'number' | 'textarea' | 'tags';

/**
 * Every field state crossed with every control that can be autofilled.
 *
 * The spec screenshots this twice — once as-is, once with `:autofill` forced on every control over CDP —
 * and the pair is the whole point. Autofill is the weakest state, so the two shots may differ only where
 * the field has no stronger state to show, and the control must never look different from the container
 * around it: a translucent tint painted on both would appear here as a darker rectangle inside the field,
 * which is exactly the regression this fixture exists to catch (#DS-4096).
 */
@Component({
    selector: 'e2e-form-field-autofill',
    imports: [KbqInputModule, KbqTextareaModule, KbqTagsModule],
    template: `
        <table data-testid="e2eFormFieldAutofillTable">
            <tbody>
                @for (state of states; track state.name) {
                    <tr>
                        <td class="e2e-row-name">{{ state.name }}</td>

                        @for (control of controls; track control) {
                            <td>
                                <!--
                                    The error state is forced with the class rather than with an
                                    ErrorStateMatcher: every control gates updateErrorState() on a
                                    truthy ngControl, and these fields carry no form control, so a
                                    matcher would never run and the error rows would render identical to
                                    the default ones — green for entirely the wrong reason.
                                -->
                                <kbq-form-field
                                    [class.cdk-focused]="state.focused"
                                    [class.cdk-keyboard-focused]="state.focused"
                                    [class.kbq-form-field_invalid]="state.error"
                                    [class.kbq-form-field_autofilled]="state.monitored"
                                    [inOverlay]="!!state.inOverlay"
                                    [noBorders]="!!state.noBorders"
                                >
                                    <!--
                                        Every block below holds exactly one root node on purpose: a
                                        control-flow block with two of them stops Angular projecting
                                        into the form field's named slots (NG8011), and the suffix would
                                        land in the wrong place — silently, in a screenshot.
                                    -->
                                    @switch (control) {
                                        @case ('input') {
                                            <input kbqInput value="Input" [disabled]="!!state.disabled" />
                                        }
                                        @case ('password') {
                                            <input kbqInputPassword value="P@ssw0rd" [disabled]="!!state.disabled" />
                                        }
                                        @case ('number') {
                                            <!--
                                                attr.value rather than value: both KbqInput and
                                                KbqNumberInput match this element and each declares a
                                                value input, with a different type. Writing the DOM
                                                attribute sidesteps the pair; the control reads its
                                                value off the element anyway.
                                            -->
                                            <input
                                                kbqNumberInput
                                                [attr.value]="'123456'"
                                                [disabled]="!!state.disabled"
                                            />
                                        }
                                        @case ('textarea') {
                                            <textarea kbqTextarea [canGrow]="false" [disabled]="!!state.disabled">
Textarea</textarea>
                                        }
                                        @case ('tags') {
                                            <kbq-tag-list #tagList [disabled]="!!state.disabled">
                                                <kbq-tag>Tag</kbq-tag>
                                                <input kbqInput value="Tag" [kbqTagInputFor]="tagList" />
                                            </kbq-tag-list>
                                        }
                                    }

                                    @if (control === 'password') {
                                        <kbq-password-toggle />
                                    }

                                    @if (control === 'number') {
                                        <kbq-stepper />
                                    }
                                </kbq-form-field>
                            </td>
                        }
                    </tr>
                }
            </tbody>
        </table>
    `,
    styles: `
        :host {
            /* Deliberately no fixed height: a fixed one crops rows out of the baseline without failing. */
            td {
                vertical-align: top;
                padding: 4px;
                width: 180px;
            }

            td.e2e-row-name {
                width: 120px;
                padding-right: var(--kbq-size-m);
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
    protected readonly controls: AutofillControl[] = ['input', 'password', 'number', 'textarea', 'tags'];

    protected readonly states: AutofillState[] = [
        { name: 'default' },
        { name: 'focused', focused: true },
        { name: 'error', error: true },
        { name: 'error + focused', error: true, focused: true },
        { name: 'disabled', disabled: true },
        { name: 'inOverlay', inOverlay: true },
        { name: 'noBorders', noBorders: true },
        { name: 'monitored (class)', monitored: true }
    ];
}
