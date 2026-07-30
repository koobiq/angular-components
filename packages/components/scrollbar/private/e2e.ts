import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqScrollbar, kbqScrollbarConfigProvider } from './scrollbar';

@Component({
    selector: 'e2e-private-scrollbar-state-and-style',
    imports: [KbqScrollbar],
    template: `
        <!-- basic -->
        <div class="e2e-scrollbar" kbqScrollbar>
            <p>basic</p>
        </div>

        <!-- hover -->
        <div class="e2e-scrollbar kbq-hover" kbqScrollbar>
            <p>hover</p>
        </div>

        <!-- active -->
        <div class="e2e-scrollbar kbq-active" kbqScrollbar>
            <p>active</p>
        </div>
    `,
    styles: `
        :host {
            display: inline-grid;
            grid-template-columns: repeat(3, 100px);
            gap: var(--kbq-size-s);
            padding: var(--kbq-size-xs);
        }

        .e2e-scrollbar {
            width: 100%;
            height: 100px;
            border-radius: var(--kbq-size-border-radius);
            background-color: var(--kbq-background-bg-secondary);
        }

        p {
            width: 200%;
            height: 200%;
            margin: var(--kbq-size-l);
        }
    `,
    providers: [kbqScrollbarConfigProvider({ visibility: 'always' })],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2ePrivateScrollbarStateAndStyle'
    }
})
export class E2ePrivateScrollbarStateAndStyle {}

@Component({
    selector: 'e2e-private-scrollbar-drag',
    imports: [KbqScrollbar],
    template: `
        <div class="e2e-scrollbar" kbqScrollbar kbqScrollbarVisibility="always" data-testid="drag">
            <p>{{ content }}</p>
        </div>

        <div
            class="e2e-scrollbar"
            kbqScrollbar
            kbqScrollbarVisibility="always"
            kbqScrollbarDisableInteraction
            data-testid="drag-disabled"
        >
            <p>{{ content }}</p>
        </div>
    `,
    styles: `
        :host {
            display: inline-flex;
            gap: var(--kbq-size-s);
            padding: var(--kbq-size-xs);
        }

        .e2e-scrollbar {
            width: 200px;
            height: 100px;
            border-radius: var(--kbq-size-border-radius);
            background-color: var(--kbq-background-bg-secondary);
        }

        p {
            width: 150%;
            margin: var(--kbq-size-l);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2ePrivateScrollbarDrag'
    }
})
export class E2ePrivateScrollbarDrag {
    readonly content = `In cryptography, a brute-force attack or exhaustive key search is a cryptanalytic attack that consists of an attacker submitting many possible keys or passwords with the hope of eventually guessing correctly. This strategy can theoretically be used to break any form of encryption that is not information-theoretically secure.[1] However, in a properly designed cryptosystem the chance of successfully guessing the key is negligible.`;
}

@Component({
    selector: 'e2e-private-scrollbar-scroll-to',
    imports: [KbqScrollbar],
    template: `
        <button data-testid="scroll-top" [disabled]="scrollbar.isTopReached()" (click)="scrollbar.scrollToTop()">
            Scroll top
        </button>
        <button
            data-testid="scroll-bottom"
            [disabled]="scrollbar.isBottomReached()"
            (click)="scrollbar.scrollToBottom()"
        >
            Scroll bottom
        </button>

        <div
            #scrollbar="kbqScrollbar"
            class="e2e-scrollbar"
            kbqScrollbar
            kbqScrollbarVisibility="always"
            data-testid="scroll-to"
        >
            <p>{{ content }}</p>
        </div>
    `,
    styles: `
        :host {
            display: block;
            padding: var(--kbq-size-xs);
        }

        .e2e-scrollbar {
            width: 200px;
            height: 100px;
            border-radius: var(--kbq-size-border-radius);
            background-color: var(--kbq-background-bg-secondary);
        }

        p {
            width: 150%;
            margin: var(--kbq-size-l);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2ePrivateScrollbarScrollTo'
    }
})
export class E2ePrivateScrollbarScrollTo {
    readonly content = `In cryptography, a brute-force attack or exhaustive key search is a cryptanalytic attack that consists of an attacker submitting many possible keys or passwords with the hope of eventually guessing correctly. This strategy can theoretically be used to break any form of encryption that is not information-theoretically secure.[1] However, in a properly designed cryptosystem the chance of successfully guessing the key is negligible.`;
}

@Component({
    selector: 'e2e-private-scrollbar-hover-visibility',
    imports: [KbqScrollbar],
    template: `
        <div class="e2e-scrollbar" kbqScrollbar data-testid="hover-visibility">
            <p>{{ content }}</p>
        </div>
    `,
    styles: `
        :host {
            display: block;
            padding: var(--kbq-size-xs);
        }

        .e2e-scrollbar {
            width: 200px;
            height: 100px;
            border-radius: var(--kbq-size-border-radius);
            background-color: var(--kbq-background-bg-secondary);
        }

        p {
            width: 150%;
            margin: var(--kbq-size-l);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2ePrivateScrollbarHoverVisibility'
    }
})
export class E2ePrivateScrollbarHoverVisibility {
    readonly content = `In cryptography, a brute-force attack or exhaustive key search is a cryptanalytic attack that consists of an attacker submitting many possible keys or passwords with the hope of eventually guessing correctly. This strategy can theoretically be used to break any form of encryption that is not information-theoretically secure.[1] However, in a properly designed cryptosystem the chance of successfully guessing the key is negligible.`;
}
