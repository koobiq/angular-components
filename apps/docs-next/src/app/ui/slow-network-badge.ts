import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DocsNextSlowNetwork } from '../services/slow-network';

/** Says in a development build that the network is slowed down (`?slow=`), and turns it off with a press. */
@Component({
    selector: 'docs-next-slow-network-badge',
    template: `
        @if (slow.label; as label) {
            <button
                class="docs-next-slow-badge"
                type="button"
                [attr.aria-label]="label + ' network emulation is on, turn it off'"
                (click)="slow.turnOff()"
            >
                {{ label }}
                <span aria-hidden="true">×</span>
            </button>
        }
    `,
    styleUrl: './slow-network-badge.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsNextSlowNetworkBadge {
    protected readonly slow = inject(DocsNextSlowNetwork);
}
