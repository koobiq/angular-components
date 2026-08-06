import { Dir } from '@angular/cdk/bidi';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqScrollbar } from '@koobiq/components/scrollbar/private';

/**
 * @title Scrollbar RTL
 */
@Component({
    selector: 'private-scrollbar-rtl-example',
    imports: [KbqScrollbar, KbqButtonModule, Dir],
    template: `
        <div class="example-buttons">
            <button kbq-button [disabled]="scrollbar.isTopReached()" (click)="scrollbar.scrollToTop('smooth')">
                Scroll top
            </button>
            <button kbq-button [disabled]="scrollbar.isBottomReached()" (click)="scrollbar.scrollToBottom('smooth')">
                Scroll bottom
            </button>
            <button kbq-button [disabled]="scrollbar.isStartReached()" (click)="scrollbar.scrollStart('smooth')">
                Scroll start
            </button>
            <button kbq-button [disabled]="scrollbar.isEndReached()" (click)="scrollbar.scrollEnd('smooth')">
                Scroll end
            </button>
        </div>

        <div dir="rtl">
            <div #scrollbar="kbqScrollbar" class="example-scrollbar" kbqScrollbar>
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
                    In cryptography, a brute-force attack or exhaustive key search is a cryptanalytic attack that
                    consists of an attacker submitting many possible keys or passwords with the hope of eventually
                    guessing correctly. This strategy can theoretically be used to break any form of encryption that is
                    not information-theoretically secure.[1] However, in a properly designed cryptosystem the chance of
                    successfully guessing the key is negligible.
                </p>
            </div>
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
export class PrivateScrollbarRtlExample {}
