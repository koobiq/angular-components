import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqScrollbar, KbqScrollbarVisibility } from '@koobiq/components/scrollbar/private';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Scrollbar visibility
 */
@Component({
    selector: 'private-scrollbar-visibility-example',
    imports: [KbqScrollbar, KbqSelectModule, FormsModule],
    template: `
        <kbq-form-field class="example-form-field">
            <kbq-select [(ngModel)]="visibility">
                @for (visibility of visibilities; track visibility) {
                    <kbq-option [value]="visibility">{{ visibility }}</kbq-option>
                }
            </kbq-select>
        </kbq-form-field>

        <div class="example-scrollbar" kbqScrollbar [kbqScrollbarVisibility]="visibility()">
            <p>
                In cryptography, a brute-force attack or exhaustive key search is a cryptanalytic attack that consists
                of an attacker submitting many possible keys or passwords with the hope of eventually guessing
                correctly. This strategy can theoretically be used to break any form of encryption that is not
                information-theoretically secure.[1] However, in a properly designed cryptosystem the chance of
                successfully guessing the key is negligible.
            </p>
            <p>
                When cracking passwords, this method is very fast when used to check all short passwords, but for longer
                passwords other methods such as the dictionary attack are used because a brute-force search takes too
                long. Longer passwords, passphrases and keys have more possible values, making them exponentially more
                difficult to crack than shorter ones due to the diversity of characters.[2]
            </p>
            <p>
                Brute-force attacks can be made less effective by implementing key stretching techniques making it more
                difficult for an attacker to recognize when the code has been cracked or by making the attacker do more
                work to test each guess. One of the measures of the strength of an encryption system is how long it
                would theoretically take an attacker to mount a successful brute-force attack against it.[3]
            </p>
            <p>
                Brute-force attacks are an application of brute-force search, the general problem-solving technique of
                enumerating all candidates and checking each one. The word 'hammering' is sometimes used to describe a
                brute-force attack,[4] with 'anti-hammering' for countermeasures.[5]
            </p>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--kbq-size-l);
            overflow: hidden;
            padding: var(--kbq-size-l);
        }

        .example-form-field {
            width: 200px;
        }

        .example-scrollbar {
            height: 200px;
            border-radius: var(--kbq-size-border-radius);
            background-color: var(--kbq-background-bg-secondary);
        }

        p {
            width: 150%;
            margin: var(--kbq-size-l);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PrivateScrollbarVisibilityExample {
    protected readonly visibilities: KbqScrollbarVisibility[] = ['always', 'hover', 'scroll', 'hidden'] as const;
    protected readonly visibility = model<KbqScrollbarVisibility>('hover');
}
