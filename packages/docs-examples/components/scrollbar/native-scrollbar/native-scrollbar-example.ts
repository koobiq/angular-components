import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqNativeScrollbar } from '@koobiq/components/scrollbar';

@Component({
    selector: 'native-scrollbar-example',
    imports: [KbqNativeScrollbar],
    template: `
        <div kbqNativeScrollbar class="example-scrollbar">
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
        </div>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: var(--kbq-size-l);
        }

        .example-scrollbar {
            overflow: auto;
            height: 200px;
            width: 100%;
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
export class NativeScrollbarExample {}
