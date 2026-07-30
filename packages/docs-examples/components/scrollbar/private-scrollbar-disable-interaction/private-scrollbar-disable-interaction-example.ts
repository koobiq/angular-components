import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqScrollbar } from '@koobiq/components/scrollbar/private';
import { KbqToggleModule } from '@koobiq/components/toggle';

/**
 * @title Scrollbar disable interaction
 */
@Component({
    selector: 'private-scrollbar-disable-interaction-example',
    imports: [KbqScrollbar, KbqToggleModule, FormsModule],
    template: `
        <kbq-toggle [(ngModel)]="disableInteraction">Disable interaction</kbq-toggle>

        <div
            class="example-scrollbar"
            kbqScrollbar
            kbqScrollbarVisibility="always"
            [kbqScrollbarDisableInteraction]="disableInteraction()"
        >
            <p>
                <strong>Drag & click for the scrollbar are {{ disableInteraction() ? 'disabled' : 'enabled' }}</strong>
            </p>
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
            gap: var(--kbq-size-l);
            overflow: hidden;
            padding: var(--kbq-size-l);
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
export class PrivateScrollbarDisableInteractionExample {
    protected readonly disableInteraction = model(true);
}
