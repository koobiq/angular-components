import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    AbstractControl,
    FormControl,
    ReactiveFormsModule,
    ValidationErrors,
    ValidatorFn,
    Validators
} from '@angular/forms';
import { kbqDisableLegacyValidationDirectiveProvider } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { MaskitoDirective } from '@maskito/angular';
import { MaskitoOptions, MaskitoPlugin, maskitoUpdateElement } from '@maskito/core';
import { maskitoNumberOptionsGenerator, maskitoWithPlaceholder } from '@maskito/kit';

/**
 * @title Input with mask
 */
@Component({
    selector: 'input-with-mask-example',
    providers: [kbqDisableLegacyValidationDirectiveProvider()],
    imports: [
        ReactiveFormsModule,
        MaskitoDirective,
        KbqFormFieldModule,
        KbqInputModule,
        KbqIconModule
    ],
    template: `
        <kbq-form-field>
            <kbq-label>IP address</kbq-label>
            <input kbqInput placeholder="192.168.0.1" [maskito]="ipAddressMask" [formControl]="ipAddressControl" />
            <kbq-hint>Format: 192.168.0.1</kbq-hint>
            <kbq-error>Invalid IP address</kbq-error>
            <kbq-cleaner />
        </kbq-form-field>

        <kbq-form-field>
            <kbq-label>MAC address</kbq-label>
            <input
                kbqInput
                placeholder="AA:BB:CC:DD:EE:FF"
                [maskito]="macAddressMask"
                [formControl]="macAddressControl"
            />
            <kbq-hint>Format: AA:BB:CC:DD:EE:FF</kbq-hint>
            <kbq-error>Invalid MAC address</kbq-error>
            <kbq-cleaner />
        </kbq-form-field>

        <kbq-form-field>
            <kbq-label>IPv6 address</kbq-label>
            <input
                kbqInput
                placeholder="2001:0db8:85a3:0000:0000:8a2e:0370:7334"
                [maskito]="ipv6AddressMask"
                [formControl]="ipv6AddressControl"
            />
            <kbq-hint>Format: 2001:0db8:85a3:0000:0000:8a2e:0370:7334</kbq-hint>
            <kbq-error>Invalid IPv6 address</kbq-error>
            <kbq-cleaner />
        </kbq-form-field>

        <kbq-form-field>
            <kbq-label>Port</kbq-label>
            <input kbqInput placeholder="8080" [maskito]="portMask" [formControl]="portControl" />
            <kbq-hint>Range: 0-65535</kbq-hint>
            <kbq-hint>Use ↑/↓ to increase or decrease the value</kbq-hint>
            <kbq-cleaner />
        </kbq-form-field>

        <kbq-form-field>
            <kbq-label>License key</kbq-label>
            <input kbqInput placeholder="XXXX-XXXX-XXXX-XXXX" [maskito]="licenseMask" [formControl]="licenseControl" />
            <kbq-error>Invalid license key</kbq-error>
            <kbq-cleaner />
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-l);
            align-items: center;
        }

        .kbq-form-field {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputWithMaskExample {
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
