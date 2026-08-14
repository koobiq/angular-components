import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqScrollbar, KbqScrollbarMode } from '@koobiq/components/scrollbar';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Scrollbar overview example
 */
@Component({
    selector: 'scrollbar-overview-example',
    imports: [KbqScrollbar, KbqSelectModule, FormsModule],
    template: `
        <kbq-form-field class="example-form-field">
            <kbq-select [(ngModel)]="mode">
                @for (mode of modes; track mode) {
                    <kbq-option [value]="mode">{{ mode }}</kbq-option>
                }
            </kbq-select>
        </kbq-form-field>

        <div class="example-scrollbar">
            <kbq-scrollbar [kbqScrollbarMode]="mode()">
                <p>
                    In cryptography, a brute-force attack or exhaustive key search is a cryptanalytic attack that
                    consists of an attacker submitting many possible keys or passwords with the hope of eventually
                    guessing correctly. This strategy can theoretically be used to break any form of encryption that is
                    not information-theoretically secure.[1] However, in a properly designed cryptosystem the chance of
                    successfully guessing the key is negligible.
                </p>
                <p>
                    When cracking passwords, this method is very fast when used to check all short passwords, but for
                    longer passwords other methods such as the dictionary attack are used because a brute-force search
                    takes too long. Longer passwords, passphrases and keys have more possible values, making them
                    exponentially more difficult to crack than shorter ones due to the diversity of characters.[2]
                </p>
                <p>
                    Brute-force attacks can be made less effective by implementing key stretching techniques making it
                    more difficult for an attacker to recognize when the code has been cracked or by making the attacker
                    do more work to test each guess. One of the measures of the strength of an encryption system is how
                    long it would theoretically take an attacker to mount a successful brute-force attack against it.[3]
                </p>
                <p>
                    Brute-force attacks are an application of brute-force search, the general problem-solving technique
                    of enumerating all candidates and checking each one. The word 'hammering' is sometimes used to
                    describe a brute-force attack,[4] with 'anti-hammering' for countermeasures.[5]
                </p>
            </kbq-scrollbar>
        </div>
    `,
    styles: `
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--kbq-size-l);
            padding: var(--kbq-size-l);
        }

        .example-form-field {
            width: 200px;
        }

        .example-scrollbar {
            overflow: auto;
            resize: both;
            height: 200px;
            min-height: 200px;
            max-height: 400px;
            width: 100%;
            min-width: 200px;
            max-width: 100%;
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
export class ScrollbarOverviewExample {
    protected readonly modes: KbqScrollbarMode[] = ['hover', 'always', 'native', 'hidden'] as const;
    protected readonly mode = model<KbqScrollbarMode>('hover');
}
