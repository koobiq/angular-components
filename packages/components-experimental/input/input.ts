import { getSupportedInputTypes } from '@angular/cdk/platform';
import { Directive, Input } from '@angular/core';
import { KBQ_TEXT_FIELD_INPUTS, KbqTextField } from '../text-field/text-field';

const KBQ_INPUT_SUPPORTED_INPUT_TYPES = new Set([
    'email',
    'number',
    'password',
    'tel',
    'text',
    'url'
]);

/** @docs-private */
export function getKbqInputUnsupportedTypeError(inputType: string): Error {
    return Error(`input type "${inputType}" isn't supported by KbqInput`);
}

/** @docs-private */
export function getKbqInputUnsupportedByBrowserTypeError(inputType: string): Error {
    return Error(`input type "${inputType}" isn't supported by browser`);
}

/** Directive that allows a native input element to work inside a `KbqFormField`. */
@Directive({
    standalone: true,
    selector: 'input[kbqInput]',
    exportAs: 'kbqInput',
    host: {
        class: 'kbq-input___EXPERIMENTAL',

        '[type]': 'type'
    },
    hostDirectives: [
        {
            directive: KbqTextField,
            inputs: KBQ_TEXT_FIELD_INPUTS
        }
    ]
})
export class KbqInput {
    /** Input element type. */
    @Input()
    set type(value: string) {
        this._type = value || 'text';

        this.checkInputType();
    }

    get type(): string {
        return this._type;
    }

    private _type = 'text';

    /** Check that the input type is supported. */
    private checkInputType(): void {
        if (!KBQ_INPUT_SUPPORTED_INPUT_TYPES.has(this._type)) {
            throw getKbqInputUnsupportedTypeError(this._type);
        }
        if (!getSupportedInputTypes().has(this._type)) {
            throw getKbqInputUnsupportedByBrowserTypeError(this._type);
        }
    }
}
