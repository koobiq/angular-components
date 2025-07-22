import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqFormsModule, ThemePalette } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';

const IP_PATTERN =
    /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

/**
 * @title Validation on blur
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'validation-on-blur-example',
    imports: [
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqFormsModule
    ],
    template: `
        <div class="kbq-form-vertical" style="width: 400px">
            <div class="kbq-form__fieldset">
                <div class="kbq-form__row">
                    <div class="kbq-form__label">IP-address</div>
                    <kbq-form-field class="kbq-form__control">
                        <input [formControl]="ipAddressControl" kbqInput />
                        @if (ipAddressControl.invalid) {
                            <kbq-error>The IP address does not comply with RFC standards</kbq-error>
                        }

                        <kbq-cleaner />
                    </kbq-form-field>
                </div>
            </div>
        </div>
    `,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    }
})
export class ValidationOnBlurExample {
    protected readonly themePalette = ThemePalette;

    protected readonly ipAddressControl: FormControl;

    constructor() {
        this.ipAddressControl = new FormControl('', [Validators.pattern(IP_PATTERN)]);
    }
}
