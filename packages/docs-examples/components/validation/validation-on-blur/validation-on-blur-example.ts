import { Component } from '@angular/core';
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
    standalone: true,
    selector: 'validation-on-blur-example',
    imports: [
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqFormsModule
    ],
    templateUrl: 'validation-on-blur-example.html'
})
export class ValidationOnBlurExample {
    themePalette = ThemePalette;

    ipAddress: FormControl;
    frequency: FormControl;

    constructor() {
        this.ipAddress = new FormControl('', [Validators.pattern(IP_PATTERN)]);
        this.frequency = new FormControl('', [Validators.min(1), Validators.max(24)]);
    }
}
