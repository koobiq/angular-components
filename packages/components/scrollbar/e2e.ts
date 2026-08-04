import { Dir } from '@angular/cdk/bidi';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { KbqScrollbar, kbqScrollbarConfigProvider } from './scrollbar';

@Component({
    selector: 'e2e-scrollbar-state-and-style',
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
        'data-testid': 'e2eScrollbarStateAndStyle'
    }
})
export class E2eScrollbarStateAndStyle {}

@Component({
    selector: 'e2e-scrollbar-drag',
    imports: [KbqScrollbar],
    template: `
        <div class="e2e-scrollbar" kbqScrollbar kbqScrollbarVisibility="always" data-testid="drag">
            <p>{{ content }}</p>
        </div>

        <div
            class="e2e-scrollbar"
            kbqScrollbar
            kbqScrollbarVisibility="always"
            kbqScrollbarDisableDrag
            data-testid="drag-disabled"
        >
            <p>{{ content }}</p>
        </div>

        <div
            class="e2e-scrollbar"
            kbqScrollbar
            kbqScrollbarVisibility="always"
            kbqScrollbarDisableClick
            data-testid="click-disabled"
        >
            <p>{{ content }}</p>
        </div>

        <div
            class="e2e-scrollbar"
            kbqScrollbar
            kbqScrollbarVisibility="always"
            kbqScrollbarDisableDrag
            kbqScrollbarDisableClick
            data-testid="both-disabled"
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
        'data-testid': 'e2eScrollbarDrag'
    }
})
export class E2eScrollbarDrag {
    readonly content = `In cryptography, a brute-force attack or exhaustive key search is a cryptanalytic attack that consists of an attacker submitting many possible keys or passwords with the hope of eventually guessing correctly. This strategy can theoretically be used to break any form of encryption that is not information-theoretically secure.[1] However, in a properly designed cryptosystem the chance of successfully guessing the key is negligible.`;
}

@Component({
    selector: 'e2e-scrollbar-scroll-to',
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
        'data-testid': 'e2eScrollbarScrollTo'
    }
})
export class E2eScrollbarScrollTo {
    readonly content = `In cryptography, a brute-force attack or exhaustive key search is a cryptanalytic attack that consists of an attacker submitting many possible keys or passwords with the hope of eventually guessing correctly. This strategy can theoretically be used to break any form of encryption that is not information-theoretically secure.[1] However, in a properly designed cryptosystem the chance of successfully guessing the key is negligible.`;
}

@Component({
    selector: 'e2e-scrollbar-hover-visibility',
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
        'data-testid': 'e2eScrollbarHoverVisibility'
    }
})
export class E2eScrollbarHoverVisibility {
    readonly content = `In cryptography, a brute-force attack or exhaustive key search is a cryptanalytic attack that consists of an attacker submitting many possible keys or passwords with the hope of eventually guessing correctly. This strategy can theoretically be used to break any form of encryption that is not information-theoretically secure.[1] However, in a properly designed cryptosystem the chance of successfully guessing the key is negligible.`;
}

/**
 * Demonstrates that appending content which grows `scrollHeight` without changing the scroll
 * element's own box size (`clientHeight`) is invisible to `KbqScrollbar` until something calls
 * `update()` — there's no `MutationObserver` watching content changes.
 */
@Component({
    selector: 'e2e-scrollbar-content-mutation',
    imports: [KbqScrollbar],
    template: `
        <button data-testid="append" (click)="append()">Append</button>
        <button data-testid="update" (click)="scrollbar.update()">Update</button>

        <div
            #scrollbar="kbqScrollbar"
            class="e2e-scrollbar"
            kbqScrollbar
            kbqScrollbarVisibility="always"
            data-testid="content-mutation"
        >
            @for (item of items(); track item) {
                <div class="row">{{ item }}</div>
            }
        </div>
    `,
    styles: `
        :host {
            display: block;
            padding: var(--kbq-size-xs);
        }

        .e2e-scrollbar {
            width: 200px;
            height: 300px;
            border-radius: var(--kbq-size-border-radius);
            background-color: var(--kbq-background-bg-secondary);
        }

        .row {
            height: 30px;
            margin: 0;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eScrollbarContentMutation'
    }
})
export class E2eScrollbarContentMutation {
    // 15 rows * 30px = 450px vs. a 300px-tall viewport — overflows, but the thumb ratio (300/450)
    // stays well above the min-thumb-size clamp, so a later shrink is actually observable.
    protected readonly items = signal(Array.from({ length: 15 }, (_, i) => i));

    protected append(): void {
        const current = this.items();

        // Pushes scrollHeight from 450px to 1050px while the container itself stays 300px tall —
        // the box size never changes, only the content that overflows it does.
        this.items.set([...current, ...Array.from({ length: 20 }, (_, i) => current.length + i)]);
    }
}

/**
 * Demonstrates that the track insets by the host's own padding instead of sitting flush with its
 * border edge — without `syncHostPadding()`, a host with its own CSS padding would leave the track
 * floating over the empty padding area instead of overlaying the real content edge.
 */
@Component({
    selector: 'e2e-scrollbar-host-padding',
    imports: [KbqScrollbar, Dir],
    template: `
        <div class="e2e-scrollbar" kbqScrollbar kbqScrollbarVisibility="always" data-testid="host-padding">
            <p>{{ content }}</p>
        </div>

        <!--
            The \`Dir\` directive (\`[dir]\`, \`@angular/cdk/bidi\`) provides \`Directionality\` locally
            from its own \`dir\` value via DI — unlike toggling \`document.documentElement.dir\` at
            runtime, which the global \`Directionality\` singleton only ever reads once, at its own
            construction (app bootstrap), so a later change wouldn't be picked up here at all.
        -->
        <div dir="rtl">
            <div class="e2e-scrollbar" kbqScrollbar kbqScrollbarVisibility="always" data-testid="host-padding-rtl">
                <p>{{ content }}</p>
            </div>
        </div>
    `,
    styles: `
        :host {
            display: block;
            padding: var(--kbq-size-xs);
        }

        .e2e-scrollbar {
            box-sizing: border-box;
            width: 200px;
            height: 100px;
            /* Deliberately asymmetric (not a single uniform value) — otherwise a bug that swaps
               two sides (e.g. left/right, or physical/logical in RTL) could go unnoticed. */
            padding: 10px 25px 15px 35px;
            border-radius: var(--kbq-size-border-radius);
            background-color: var(--kbq-background-bg-secondary);
            margin-bottom: var(--kbq-size-l);
        }

        p {
            width: 150%;
            margin: var(--kbq-size-l);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eScrollbarHostPadding'
    }
})
export class E2eScrollbarHostPadding {
    readonly content = `In cryptography, a brute-force attack or exhaustive key search is a cryptanalytic attack that consists of an attacker submitting many possible keys or passwords with the hope of eventually guessing correctly. This strategy can theoretically be used to break any form of encryption that is not information-theoretically secure.[1] However, in a properly designed cryptosystem the chance of successfully guessing the key is negligible.`;
}

/**
 * No focusable descendants inside the scrollable content — a keyboard-only user must be able to
 * reach and operate the scroll region itself (Tab to focus it, arrow/paging keys to scroll it),
 * the same way the native scrollbar it replaces would allow.
 */
@Component({
    selector: 'e2e-scrollbar-keyboard',
    imports: [KbqScrollbar],
    template: `
        <div class="e2e-scrollbar" kbqScrollbar kbqScrollbarVisibility="always" data-testid="keyboard">
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
            height: 400%;
            margin: var(--kbq-size-l);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eScrollbarKeyboard'
    }
})
export class E2eScrollbarKeyboard {
    readonly content = `In cryptography, a brute-force attack or exhaustive key search is a cryptanalytic attack that consists of an attacker submitting many possible keys or passwords with the hope of eventually guessing correctly. This strategy can theoretically be used to break any form of encryption that is not information-theoretically secure.[1] However, in a properly designed cryptosystem the chance of successfully guessing the key is negligible.`;
}
