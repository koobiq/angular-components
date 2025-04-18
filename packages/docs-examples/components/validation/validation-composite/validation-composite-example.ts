import { Component, ViewChild } from '@angular/core';
import {
    AbstractControl,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    ValidationErrors,
    ValidatorFn
} from '@angular/forms';
import { KbqFormsModule, PopUpPlacements, ThemePalette } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';

function groupValidator(): ValidatorFn {
    return (g: AbstractControl | FormGroup): ValidationErrors | null => {
        const start = g.get('start')?.value;
        const end = g.get('end')?.value;

        if (IP_PATTERN.test(start) && IP_PATTERN.test(end)) {
            const parsedStartIp = start.split('.').map((octet) => parseInt(octet, 10));
            const parsedEndIp = end.split('.').map((octet) => parseInt(octet, 10));

            for (let i = 0; i < parsedStartIp.length; i++) {
                if (parsedStartIp[i] > parsedEndIp[i]) {
                    return { range: true };
                }
            }
        }

        return null;
    };
}

function fieldValidator(regex: RegExp): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.value) {
            return null;
        }

        return regex.test(control.value) ? null : { pattern: true };
    };
}

const IP_PATTERN =
    /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

/**
 * @title Validation composite
 */
@Component({
    standalone: true,
    selector: 'validation-composite-example',
    templateUrl: 'validation-composite-example.html',
    imports: [
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqToolTipModule,
        KbqInputModule,
        KbqFormsModule
    ],
    styles: `
        .validation-error {
            background-color: #fcefec;
            border-radius: 4px;
        }
    `
})
export class ValidationCompositeExample {
    popUpPlacements = PopUpPlacements;
    themePalette = ThemePalette;

    compositeFormGroup: FormGroup;

    @ViewChild('startTooltip', { static: false }) startTooltip: any;
    @ViewChild('endTooltip', { static: false }) endTooltip: any;

    constructor() {
        this.compositeFormGroup = new FormGroup(
            {
                start: new FormControl('', [fieldValidator(IP_PATTERN)]),
                end: new FormControl('', [fieldValidator(IP_PATTERN)])
            },
            { updateOn: 'blur', validators: [groupValidator()] }
        );
    }

    onInput(event, tooltip: KbqTooltipTrigger, controlName: string) {
        const regex = /^[\d\.]+$/g;

        if (!regex.test(event.target.value)) {
            const newValue = event.target.value.replace(/[^\d\.]+/g, '');

            this.compositeFormGroup.controls[controlName].setValue(newValue);

            if (!tooltip.isOpen) {
                tooltip.show();

                setTimeout(() => tooltip.hide(), 3000);
            }
        }
    }
}
