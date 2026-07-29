import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqScrollbar, kbqScrollbarConfigProvider } from './scrollbar';

@Component({
    selector: 'e2e-private-scrollbar-state-and-style',
    imports: [KbqScrollbar],
    template: `
        <!-- basic -->
        <div class="e2e-scrollbar" kbqScrollbar>
            <p>
                <b>[basic]</b>
                {{ content }}
            </p>
        </div>

        <!-- hover -->
        <div class="e2e-scrollbar kbq-hover" kbqScrollbar>
            <p>
                <b>[hover]</b>
                {{ content }}
            </p>
        </div>

        <!-- active -->
        <div class="e2e-scrollbar kbq-active" kbqScrollbar>
            <p>
                <b>[active]</b>
                {{ content }}
            </p>
        </div>
    `,
    styles: `
        :host {
            display: inline-grid;
            grid-template-columns: repeat(2, 250px);
            gap: var(--kbq-size-s);
            padding: var(--kbq-size-xs);
        }

        .e2e-scrollbar {
            height: 100px;
            border-radius: var(--kbq-size-border-radius);
            background-color: var(--kbq-background-bg-secondary);
        }

        p {
            width: 150%;
            margin: var(--kbq-size-l);
        }
    `,
    providers: [kbqScrollbarConfigProvider({ visibility: 'always' })],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2ePrivateScrollbarStateAndStyle'
    }
})
export class E2ePrivateScrollbarStateAndStyle {
    readonly content = `In cryptography, a brute-force attack or exhaustive key search is a cryptanalytic attack that consists of an attacker submitting many possible keys or passwords with the hope of eventually guessing correctly. This strategy can theoretically be used to break any form of encryption that is not information-theoretically secure.[1] However, in a properly designed cryptosystem the chance of successfully guessing the key is negligible.`;
}
