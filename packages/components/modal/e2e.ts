import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqModalModule, KbqModalService } from '@koobiq/components/modal';

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
        <kbq-modal-title>Full custom modal title</kbq-modal-title>

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
    protected readonly items = Array.from({ length: 30 }, (_, i) => `Item #${i}`);
}

@Component({
    selector: 'e2e-modal-full-custom',
    template: `
        <button data-testid="e2eOpenModal" (click)="open()">Open modal</button>
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

    // A long wrapping paragraph so the fixed-height body overflows and scrolls.
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
