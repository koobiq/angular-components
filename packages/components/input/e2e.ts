import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { AbstractControl, FormGroupDirective, FormsModule, NgForm } from '@angular/forms';
import {
    ErrorStateMatcher,
    kbqDisableLegacyValidationDirectiveProvider,
    KbqNormalizeWhitespace
} from '@koobiq/components/core';
import { PasswordRules } from '@koobiq/components/form-field';
import { KbqInputModule } from './input.module';

type InputStates = {
    state: ('default' | 'focused' | 'disabled' | 'placeholder' | 'invalid' | 'autofill' | 'error' | 'ellipsis')[];
    inputNumberHasSeparator?: boolean;
};

class CustomErrorStateMatcher implements ErrorStateMatcher {
    constructor(private state: ('error' | string)[]) {}

    isErrorState(_control: AbstractControl | null, _form: FormGroupDirective | NgForm | null): boolean {
        return this.state.includes('error');
    }
}

@Component({
    selector: 'e2e-input-state-and-style',
    imports: [
        KbqNormalizeWhitespace,
        KbqInputModule,
        FormsModule
    ],
    template: `
        <div>
            <div data-testid="e2eInputTable" class="e2e__grid">
                @for (state of states; track $index) {
                    <div class="e2e__row">
                        @for (cell of state; track $index) {
                            <div class="e2e__cell" [class.has_ellipsis]="cell.state.includes('ellipsis')">
                                <kbq-form-field
                                    [class.cdk-keyboard-focused]="cell.state.includes('focused')"
                                    [class.cdk-focused]="cell.state.includes('focused')"
                                >
                                    <input
                                        kbqInput
                                        placeholder="kbqInput"
                                        [errorStateMatcher]="errorStateMatcher(cell.state)"
                                        [disabled]="cell.state.includes('disabled')"
                                        [ngModel]="cell.state.join().includes('placeholder') ? '' : inputValue()"
                                        (ngModelChange)="inputValue.set($event)"
                                    />
                                </kbq-form-field>
                            </div>

                            <div class="e2e__cell" [class.has_ellipsis]="cell.state.includes('ellipsis')">
                                <kbq-form-field
                                    [class.cdk-keyboard-focused]="cell.state.includes('focused')"
                                    [class.cdk-focused]="cell.state.includes('focused')"
                                >
                                    <input
                                        kbqInput
                                        kbqInputMonospace
                                        [errorStateMatcher]="errorStateMatcher(cell.state)"
                                        [disabled]="cell.state.includes('disabled')"
                                        [placeholder]="'Inp@t M0n0'"
                                        [ngModel]="cell.state.join().includes('placeholder') ? '' : inputMonoValue()"
                                        (ngModelChange)="inputMonoValue.set($event)"
                                    />
                                </kbq-form-field>
                            </div>

                            <div class="e2e__cell" [class.has_ellipsis]="cell.state.includes('ellipsis')">
                                <kbq-form-field
                                    [class.cdk-keyboard-focused]="cell.state.includes('focused')"
                                    [class.cdk-focused]="cell.state.includes('focused')"
                                >
                                    <input
                                        kbqNormalizeWhitespace
                                        kbqNumberInput
                                        placeholder="NumberInput"
                                        [errorStateMatcher]="errorStateMatcher(cell.state)"
                                        [withThousandSeparator]="
                                            cell.inputNumberHasSeparator === undefined
                                                ? true
                                                : cell.inputNumberHasSeparator
                                        "
                                        [disabled]="cell.state.includes('disabled')"
                                        [ngModel]="
                                            cell.state.join().includes('placeholder') ? null : inputNumberValue()
                                        "
                                        (ngModelChange)="inputNumberValue.set($event)"
                                    />
                                    <kbq-stepper />
                                </kbq-form-field>
                            </div>
                        }
                    </div>
                }
            </div>
        </div>

        <div>
            <div class="e2e__grid" data-testid="e2eInputPasswordTable">
                @for (state of states; track $index) {
                    <div class="e2e__row">
                        @for (cell of state; track $index) {
                            <div class="e2e__cell" [class.has_ellipsis]="cell.state.includes('ellipsis')">
                                <kbq-form-field
                                    [class.cdk-keyboard-focused]="cell.state.includes('focused')"
                                    [class.cdk-focused]="cell.state.includes('focused')"
                                    [class.kbq-disabled]="cell.state.includes('disabled')"
                                >
                                    <input
                                        kbqInputPassword
                                        placeholder="kbqInputPassword"
                                        [errorStateMatcher]="errorStateMatcher(cell.state)"
                                        [disabled]="cell.state.includes('disabled')"
                                        [ngModel]="cell.state.join().includes('placeholder') ? '' : inputMonoValue()"
                                        (ngModelChange)="inputMonoValue.set($event)"
                                    />

                                    <kbq-password-toggle />
                                </kbq-form-field>
                            </div>
                        }
                    </div>
                }
            </div>
            <div>
                <kbq-form-field style="margin-top: 16px; width: 200px" data-testid="e2eInputPasswordWithHints">
                    <input
                        kbqInputPassword
                        placeholder="kbqInputPassword"
                        [ngModel]="inputMonoValue()"
                        (ngModelChange)="inputMonoValue.set($event)"
                    />

                    <kbq-password-toggle />

                    <kbq-password-hint [min]="8" [max]="15" [rule]="passwordRules.Length">
                        8 - 15 symbols
                    </kbq-password-hint>

                    <kbq-reactive-password-hint [hasError]="true">Min length</kbq-reactive-password-hint>
                </kbq-form-field>
            </div>
        </div>
    `,
    styles: `
        :host {
            .e2e__grid {
                display: inline-flex;
                flex-direction: column;
                gap: 4px;
            }

            .e2e__row {
                display: flex;
                gap: 4px;
            }

            .e2e__cell {
                display: flex;
                vertical-align: top;
                width: 200px;
            }

            div.has_ellipsis {
                width: 75px;
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-top-l layout-margin-bottom-l layout-column',
        'data-testid': 'e2eInputStateAndStyle'
    },
    providers: [
        kbqDisableLegacyValidationDirectiveProvider()
    ]
})
export class E2eInputStateAndStyle {
    inputValue = signal('Input Value');
    inputMonoValue = signal('P@a$$w0rd');
    inputNumberValue = signal(123456);
    errorStateMatcher = (state: ('error' | string)[]): ErrorStateMatcher => new CustomErrorStateMatcher(state);

    states: InputStates[][] = [
        [{ state: ['placeholder'] }],
        [{ state: ['ellipsis'] }],
        [{ state: ['default'] }],
        [{ state: ['default'], inputNumberHasSeparator: false }],
        [{ state: ['focused'] }],
        [{ state: ['error'] }],
        [{ state: ['error', 'focused'] }],
        [{ state: ['disabled'] }]
    ];

    protected readonly passwordRules = PasswordRules;
}
