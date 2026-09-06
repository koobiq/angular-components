import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KBQ_MODAL_DATA, KbqModalModule, KbqModalService } from '@koobiq/components/modal';

@Component({
    selector: 'e2e-modal-states',
    template: `
        <button data-testid="e2eOpenModal" (click)="open()">Open modal</button>
        <button data-testid="e2eMultipleModals" (click)="openMultiple()">Open multiple modals</button>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 350px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eModalStates'
    }
})
export class E2eModalStates {
    private readonly modal = inject(KbqModalService);

    protected open(): void {
        this.modal.create({
            kbqWidth: '400px',
            kbqTitle: 'Multi-line modal title multi-line modal title multi-line modal title multi-line modal title',
            kbqCaption:
                'Multi-line caption text that overflows after two lines multi-line caption text that overflows after two lines',
            kbqContent: `In a distributed denial-of-service attack (DDoS attack), the incoming traffic flooding the victim originates
            from many different sources. More sophisticated strategies are required to mitigate this type of attack;
            simply attempting to block a single source is insufficient as there are multiple sources. A DoS or DDoS
            attack is analogous to a group of people crowding the entry door of a shop, making it hard for legitimate
            customers to enter, thus disrupting trade and losing the business money. Criminal perpetrators of DoS
            attacks often target sites or services hosted on high-profile web servers such as banks or credit card
            payment gateways. Revenge and blackmail, as well as hacktivism, can motivate these attacks.`,
            kbqOkText: 'Ok',
            kbqCancelText: 'Cancel'
        });
    }

    protected openMultiple(): void {
        this.modal.create({
            kbqWidth: '340px',
            kbqBodyStyle: { height: '100px' },
            kbqTitle: 'Modal title',
            kbqContent: `Modal content.`,
            kbqOkText: 'Ok',
            kbqCancelText: 'Cancel'
        });

        this.modal.create({
            kbqWidth: '280px',
            kbqContent: `Koobiq is awesome!`,
            kbqOkText: 'Agree'
        });
    }
}

@Component({
    selector: 'e2e-modal-full-custom-content',
    imports: [KbqModalModule, KbqButtonModule],
    template: `
        <kbq-modal-title>
            Full custom modal title

            <!-- Rendered unconditionally: an @if block would not match the caption projection slot. -->
            <kbq-modal-caption>{{ caption }}</kbq-modal-caption>
        </kbq-modal-title>

        <kbq-modal-body>
            @for (item of items; track $index) {
                <p>{{ item }}</p>
            }
        </kbq-modal-body>

        <div kbq-modal-footer>
            <button kbq-button>Ok</button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class E2eModalFullCustomContent {
    protected readonly caption = inject<string | undefined>(KBQ_MODAL_DATA, { optional: true });
    protected readonly items = Array.from({ length: 30 }, (_, i) => `Item #${i}`);
}

@Component({
    selector: 'e2e-modal-full-custom',
    template: `
        <button data-testid="e2eOpenModal" (click)="open()">Open modal</button>
        <button data-testid="e2eOpenModalWithCaption" (click)="openWithCaption()">Open modal with caption</button>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 350px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eModalFullCustom'
    }
})
export class E2eModalFullCustom {
    private readonly modal = inject(KbqModalService);

    protected open(): void {
        this.modal.open({
            kbqWidth: '400px',
            kbqComponent: E2eModalFullCustomContent
        });
    }

    protected openWithCaption(): void {
        this.modal.open({
            kbqWidth: '400px',
            kbqComponent: E2eModalFullCustomContent,
            data: 'Full custom modal caption'
        });
    }
}

@Component({
    selector: 'e2e-modal-scrollbar',
    template: `
        <button data-testid="e2eOpenModal" (click)="open()">Open modal</button>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;
            align-items: center;

            width: 400px;
            height: 400px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eModalScrollbar'
    }
})
export class E2eModalScrollbar {
    private readonly modal = inject(KbqModalService);

    protected readonly content = Array.from({ length: 40 }, (_, i) => `Scrollable modal line ${i}`).join(' ');

    protected open(): void {
        this.modal.create({
            kbqWidth: '360px',
            kbqBodyStyle: { height: '200px' },
            kbqTitle: 'Scrollable modal',
            kbqContent: this.content,
            kbqOkText: 'Ok',
            kbqCancelText: 'Cancel'
        });
    }
}

@Component({
    selector: 'e2e-modal-scrollbar-no-overflow',
    template: `
        <button data-testid="e2eOpenModal" (click)="open()">Open modal</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eModalScrollbarNoOverflow'
    }
})
export class E2eModalScrollbarNoOverflow {
    private readonly modal = inject(KbqModalService);

    protected open(): void {
        this.modal.create({
            kbqWidth: '360px',
            kbqTitle: 'Modal',
            kbqContent: 'Short content',
            kbqOkText: 'Ok'
        });
    }
}

/**
 * A single-line title, no footer and a body long enough to overflow: the case where the dialog has
 * to reach the bottom gutter of the viewport instead of stopping at a fixed pixel budget.
 */
@Component({
    selector: 'e2e-modal-no-footer',
    template: `
        <button data-testid="e2eOpenModal" (click)="open()">Open modal</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eModalNoFooter'
    }
})
export class E2eModalNoFooter {
    private readonly modal = inject(KbqModalService);

    protected readonly content = Array.from({ length: 60 }, (_, i) => `No-footer modal line ${i}`).join(' ');

    protected open(): void {
        this.modal.create({
            kbqWidth: '360px',
            kbqTitle: 'Single-line title',
            kbqContent: this.content
        });
    }
}
