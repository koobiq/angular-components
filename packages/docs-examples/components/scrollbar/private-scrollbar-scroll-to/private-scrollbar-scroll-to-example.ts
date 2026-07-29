import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqScrollbar } from '@koobiq/components/scrollbar/private';

/**
 * @title Scrollbar scrollTo methods
 */
@Component({
    selector: 'private-scrollbar-scroll-to-example',
    imports: [KbqScrollbar, KbqButtonModule],
    template: `
        <div class="example-buttons">
            <button kbq-button [disabled]="scrollbar.isAtTop()" (click)="scrollbar.scrollToTop('smooth')">
                Scroll top
            </button>
            <button kbq-button [disabled]="scrollbar.isAtBottom()" (click)="scrollbar.scrollToBottom('smooth')">
                Scroll bottom
            </button>
            <button kbq-button [disabled]="scrollbar.isAtStart()" (click)="scrollbar.scrollStart('smooth')">
                Scroll start
            </button>
            <button kbq-button [disabled]="scrollbar.isAtEnd()" (click)="scrollbar.scrollEnd('smooth')">
                Scroll end
            </button>
            <button
                kbq-button
                (click)="scrollbar.scrollToElement(scrollTarget, { behavior: 'smooth', top: 16, left: 16 })"
            >
                Scroll to element
            </button>
        </div>

        <div #scrollbar="kbqScrollbar" class="example-scrollbar" kbqScrollbar kbqScrollbarVisibility="always">
            <p>
                In cryptography, a brute-force attack or exhaustive key search is a cryptanalytic attack that consists
                of an attacker submitting many possible keys or passwords with the hope of eventually guessing
                correctly. This strategy can theoretically be used to break any form of encryption that is not
                information-theoretically secure.[1] However, in a properly designed cryptosystem the chance of
                successfully guessing the key is negligible.
            </p>
            <p>
                Brute-force attacks can be made less effective by implementing key stretching techniques making it more
                difficult for an attacker to recognize when the code has been cracked or by making the attacker do more
                work to test each guess. One of the measures of the strength of an encryption system is how long it
                would theoretically take an attacker to mount a successful brute-force attack against it.[3]
            </p>
            <p #scrollTarget>
                <b>[Scroll target]</b>
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

        .example-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: var(--kbq-size-s);
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
export class PrivateScrollbarScrollToExample {}
