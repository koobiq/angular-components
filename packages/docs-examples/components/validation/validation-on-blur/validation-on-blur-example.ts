import { Component, ViewEncapsulation } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ThemePalette } from '@koobiq/components/core';

const IP_PATTERN =
    /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

/**
 * @title validation-on-blur
 */
@Component({
    selector: 'validation-on-blur-example',
    templateUrl: 'validation-on-blur-example.html',
    styleUrls: ['validation-on-blur-example.css'],
    encapsulation: ViewEncapsulation.None
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
