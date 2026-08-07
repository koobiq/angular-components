import { ChangeDetectionStrategy, Component } from '@angular/core';
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
