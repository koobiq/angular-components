import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    type AbstractControl,
    FormControl,
    ReactiveFormsModule,
    type ValidationErrors,
    type ValidatorFn,
    Validators
} from '@angular/forms';
import { MaskitoDirective } from '@maskito/angular';
import { type MaskitoOptions, type MaskitoPlugin, maskitoUpdateElement } from '@maskito/core';
import { maskitoNumberOptionsGenerator, maskitoWithPlaceholder } from '@maskito/kit';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Input with mask
 */
@Component({
    selector: 'input-with-mask-example',
    imports: [
        ReactiveFormsModule,
        MaskitoDirective,
        KbqInputModule,
        KbqIconModule
    ],
    template: `
        <kbq-form-field>
            <kbq-label>{{ t().amount }}</kbq-label>
            <input kbqInput [maskito]="amountMask" [formControl]="amountControl" />
            <kbq-hint>{{ t().useArrows }}</kbq-hint>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-label>{{ t().percent }}</kbq-label>
            <input kbqInput [placeholder]="t().placeholder" [maskito]="percentMask" [formControl]="percentControl" />
        </kbq-form-field>

        <kbq-form-field>
            <kbq-label>{{ t().phone }}</kbq-label>
            <input kbqInput [maskito]="phoneMask" [formControl]="phoneControl" />
            <kbq-hint>{{ t().format }} +7 (999) 123-45-67</kbq-hint>
        </kbq-form-field>

        <kbq-form-field>
            <kbq-label>{{ t().ipv4Address }}</kbq-label>
            <input kbqInput placeholder="192.168.0.1" [maskito]="ipAddressMask" [formControl]="ipAddressControl" />
            <kbq-hint>{{ t().format }} 192.168.0.1</kbq-hint>
            <kbq-error>{{ t().invalidIp }}</kbq-error>
            <kbq-cleaner />
        </kbq-form-field>

        <kbq-form-field>
            <kbq-label>{{ t().ipv6Address }}</kbq-label>
            <input
                kbqInput
                placeholder="2001:0db8:85a3:0000:0000:8a2e:0370:7334"
                [maskito]="ipv6AddressMask"
                [formControl]="ipv6AddressControl"
            />
            <kbq-hint>{{ t().format }} 2001:0db8:85a3:0000:0000:8a2e:0370:7334</kbq-hint>
            <kbq-error>{{ t().invalidIpv6 }}</kbq-error>
            <kbq-cleaner />
        </kbq-form-field>

        <kbq-form-field>
            <kbq-label>{{ t().macAddress }}</kbq-label>
            <input
                kbqInput
                placeholder="AA:BB:CC:DD:EE:FF"
                [maskito]="macAddressMask"
                [formControl]="macAddressControl"
            />
            <kbq-hint>{{ t().format }} AA:BB:CC:DD:EE:FF</kbq-hint>
            <kbq-error>{{ t().invalidMac }}</kbq-error>
            <kbq-cleaner />
        </kbq-form-field>

        <kbq-form-field>
            <kbq-label>{{ t().port }}</kbq-label>
            <input kbqInput placeholder="8080" [maskito]="portMask" [formControl]="portControl" />
            <kbq-hint>{{ t().range }}</kbq-hint>
            <kbq-hint>{{ t().useArrows }}</kbq-hint>
            <kbq-cleaner />
        </kbq-form-field>

        <kbq-form-field>
            <kbq-label>{{ t().licenseKey }}</kbq-label>
            <input kbqInput placeholder="XXXX-XXXX-XXXX-XXXX" [maskito]="licenseMask" [formControl]="licenseControl" />
            <kbq-error>{{ t().invalidLicense }}</kbq-error>
            <kbq-cleaner />
        </kbq-form-field>
    `,
    styles: `
        .kbq-form-field {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-5xl layout-column layout-gap-l layout-align-center-center'
    }
})
export class InputWithMaskExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    readonly amountControl = new FormControl('');
    readonly percentControl = new FormControl('');
    readonly phoneControl = new FormControl('+7 (999) 123-45-67');
    readonly ipAddressControl = new FormControl('192.168.0.1', [this.ipAddressValidator()]);
    readonly macAddressControl = new FormControl('AA:BB:CC:DD:EE:FF', [
        Validators.pattern(/^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/)
    ]);
    readonly ipv6AddressControl = new FormControl('2001:0db8:85a3:0000:0000:8a2e:0370:7334', [
        Validators.pattern(/^([0-9A-Fa-f]{4}:){7}[0-9A-Fa-f]{4}$/)
    ]);
    readonly portControl = new FormControl('8080');
    readonly licenseControl = new FormControl('ABCD-1234-EFGH-5678', [
        Validators.pattern(/^[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}$/)
    ]);

    readonly amountMask = this.makeAmountMaskOptions();
    readonly percentMask = maskitoNumberOptionsGenerator({
        min: 0,
        max: 100,
        maximumFractionDigits: 0,
        thousandSeparator: '',
        postfix: '%'
    });
    readonly phoneMask: MaskitoOptions = {
        mask: [
            '+',
            '7',
            ' ',
            '(',
            /\d/,
            /\d/,
            /\d/,
            ')',
            ' ',
            /\d/,
            /\d/,
            /\d/,
            '-',
            /\d/,
            /\d/,
            '-',
            /\d/,
            /\d/
        ]
    };
    readonly ipAddressMask = this.makeIPAddressMaskOptions();
    readonly macAddressMask = this.makeMACAddressMaskOptions();
    readonly ipv6AddressMask = this.makeIPv6AddressMaskOptions();
    readonly portMask = this.makePortMaskOptions();
    readonly licenseMask = this.makeLicenseMaskOptions();

    private makeIPAddressMaskOptions(): MaskitoOptions {
        return {
            mask: ({ value }) => {
                const octets = value.split('.');

                return octets.flatMap((octet, index) => {
                    const digitCount = Math.max(1, Math.min(3, octet.length));
                    const digits = Array.from<RegExp>({ length: digitCount }).fill(/\d/);

                    return index < 3 ? [...digits, '.'] : digits;
                });
            }
        };
    }

    private makeMACAddressMaskOptions(): MaskitoOptions {
        const hexChar = /[0-9A-Fa-f]/;

        return {
            mask: [
                hexChar,
                hexChar,
                ':',
                hexChar,
                hexChar,
                ':',
                hexChar,
                hexChar,
                ':',
                hexChar,
                hexChar,
                ':',
                hexChar,
                hexChar,
                ':',
                hexChar,
                hexChar
            ],
            postprocessors: [
                ({ value, selection }) => ({ value: value.toUpperCase(), selection })
            ]
        };
    }

    private makeIPv6AddressMaskOptions(): MaskitoOptions {
        const hexChar = /[0-9A-Fa-f]/;

        return {
            mask: [
                hexChar,
                hexChar,
                hexChar,
                hexChar,
                ':',
                hexChar,
                hexChar,
                hexChar,
                hexChar,
                ':',
                hexChar,
                hexChar,
                hexChar,
                hexChar,
                ':',
                hexChar,
                hexChar,
                hexChar,
                hexChar,
                ':',
                hexChar,
                hexChar,
                hexChar,
                hexChar,
                ':',
                hexChar,
                hexChar,
                hexChar,
                hexChar,
                ':',
                hexChar,
                hexChar,
                hexChar,
                hexChar,
                ':',
                hexChar,
                hexChar,
                hexChar,
                hexChar
            ],
            postprocessors: [
                ({ value, selection }) => ({ value: value.toLowerCase(), selection })
            ]
        };
    }

    private ipAddressValidator(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const value = control.value;

            if (!value) return null;

            const octets = value.split('.');

            if (octets.length !== 4) return { invalidIp: true };

            const isValid = octets.every((octet: string) => {
                const num = parseInt(octet, 10);

                return !isNaN(num) && num >= 0 && num <= 255 && octet === String(num);
            });

            return isValid ? null : { invalidIp: true };
        };
    }

    private makeAmountMaskOptions(): MaskitoOptions {
        const min = 0;
        const options = maskitoNumberOptionsGenerator({ min, maximumFractionDigits: 2 });
        const stepPlugin: MaskitoPlugin = (element) => {
            const handler = (event: KeyboardEvent) => {
                if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;

                event.preventDefault();
                const step = event.key === 'ArrowUp' ? 1 : -1;
                const currentValue = parseFloat(element.value.replace(/\s/g, '').replace(',', '.')) || 0;
                const newValue = Math.max(min, currentValue + step);

                maskitoUpdateElement(element, String(newValue));
            };

            element.addEventListener('keydown', handler);

            return () => element.removeEventListener('keydown', handler);
        };

        return { ...options, plugins: [...options.plugins, stepPlugin] };
    }

    private makePortMaskOptions(): MaskitoOptions {
        const min = 0;
        const max = 65535;
        const options = maskitoNumberOptionsGenerator({
            min,
            max,
            maximumFractionDigits: 0,
            thousandSeparator: ''
        });

        const stepPlugin: MaskitoPlugin = (element) => {
            const handler = (event: KeyboardEvent) => {
                if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') {
                    return;
                }

                event.preventDefault();

                const step = event.key === 'ArrowUp' ? 1 : -1;
                const currentValue = parseInt(element.value, 10) || 0;
                const newValue = Math.min(max, Math.max(min, currentValue + step));

                maskitoUpdateElement(element, String(newValue));
            };

            element.addEventListener('keydown', handler);

            return () => element.removeEventListener('keydown', handler);
        };

        return {
            ...options,
            plugins: [...options.plugins, stepPlugin]
        };
    }

    private makeLicenseMaskOptions(): MaskitoOptions {
        const alphanumeric = /[A-Za-z0-9]/;

        return {
            ...maskitoWithPlaceholder('____-____-____-____', true),
            mask: [
                alphanumeric,
                alphanumeric,
                alphanumeric,
                alphanumeric,
                '-',
                alphanumeric,
                alphanumeric,
                alphanumeric,
                alphanumeric,
                '-',
                alphanumeric,
                alphanumeric,
                alphanumeric,
                alphanumeric,
                '-',
                alphanumeric,
                alphanumeric,
                alphanumeric,
                alphanumeric
            ]
        };
    }
}
