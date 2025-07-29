import { afterNextRender, ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
    KbqComponentColors,
    kbqDisableLegacyValidationDirectiveProvider,
    PopUpPlacements
} from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqToolTipModule, KbqTooltipTrigger } from '@koobiq/components/tooltip';

const IP_PATTERN =
    /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;

const restSymbolsRegex = /[^0-9.]+/g;

/**
 * @title Validation on blur filled
 */
@Component({
    selector: 'validation-on-blur-filled-example',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqToolTipModule
    ],
    template: `
        <kbq-form-field style="width: 320px;">
            <kbq-label>IP-address</kbq-label>
            <input
                [formControl]="ipAddressControl"
                [kbqEnterDelay]="10"
                [kbqPlacement]="popUpPlacements.Top"
                [kbqTrigger]="'manual'"
                [kbqTooltip]="'Numbers and dots (.) only'"
                [kbqTooltipColor]="colors.Error"
                (input)="onInput($event)"
                kbqInput
            />

            <kbq-error>The IP address does not comply with RFC standards</kbq-error>

            <kbq-cleaner />
        </kbq-form-field>
    `,
    host: {
        class: 'layout-margin-5xl layout-align-center-center layout-row'
    },
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValidationOnBlurFilledExample {
    protected readonly tooltip = viewChild(KbqTooltipTrigger);
    protected readonly ipAddressControl = new FormControl('123...12123123', [Validators.pattern(IP_PATTERN)]);

    constructor() {
        afterNextRender(() => this.ipAddressControl.markAsTouched());
    }

    protected readonly colors = KbqComponentColors;
    protected readonly popUpPlacements = PopUpPlacements;

    onInput(event: Event): void {
        const allowedSymbolsRegex = /^[0-9.]+$/g;

        if (event.target instanceof HTMLInputElement && !allowedSymbolsRegex.test(event.target.value)) {
            const newValue = event.target.value.replace(restSymbolsRegex, '');

            this.ipAddressControl.setValue(newValue);

            const tooltip = this.tooltip();

            if (tooltip && !tooltip.isOpen) {
                tooltip.show();

                setTimeout(() => tooltip.hide(), 3000);
            }
        }
    }
}
