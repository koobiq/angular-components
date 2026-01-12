import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { KbqModalModule, KbqModalService } from '@koobiq/components/modal';

@Component({
    selector: 'e2e-modal-states',
    imports: [KbqModalModule],
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
    host: {
        'data-testid': 'e2eModalStates'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class E2eModalStates {
    private readonly modal = inject(KbqModalService);

    protected open(): void {
        this.modal.create({
            kbqWidth: '300px',
            kbqTitle: 'Multi-line modal title multi-line modal title multi-line modal title',
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
