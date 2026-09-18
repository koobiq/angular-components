import { ChangeDetectionStrategy, Component, inject, Injector, signal } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KBQ_MODAL_DATA, KbqModalModule, KbqModalService } from '@koobiq/components/modal';
import { kbqScrollbarOptionsProvider } from '@koobiq/components/scrollbar';

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

const E2E_MODAL_SCROLLABLE_CONTENT = Array.from({ length: 40 }, (_, i) => `Scrollable modal line ${i}`).join(' ');

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

    protected open(): void {
        this.modal.create({
            kbqWidth: '360px',
            kbqBodyStyle: { height: '200px' },
            kbqTitle: 'Scrollable modal',
            kbqContent: E2E_MODAL_SCROLLABLE_CONTENT,
            kbqOkText: 'Ok',
            kbqCancelText: 'Cancel'
        });
    }
}

@Component({
    selector: 'e2e-modal-scrollbar-flash',
    template: `
        <button data-testid="e2eOpenModal" (click)="open()">Open modals</button>
    `,
    providers: [
        // The reveal lasts hideDelay and nothing brings it back, so the default second would make this
        // a race against the opening animation rather than a test of the behaviour.
        kbqScrollbarOptionsProvider({ hideDelay: 5000 })
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eModalScrollbarFlash'
    }
})
export class E2eModalScrollbarFlash {
    private readonly modal = inject(KbqModalService);
    // Handed to every modal so it resolves the scrollbar options declared above; the service would
    // otherwise build the modal from the root injector, where they are not provided.
    private readonly injector = inject(Injector);

    protected open(): void {
        // All at once, so the modal that cannot scroll is asserted on a page where a track has
        // demonstrably had its first tick. The tall one opens first: only the wrap opened last is under
        // a pointer parked outside the dialogs, and that wrap must not be the one asserted.
        this.modal.create({
            kbqWidth: '320px',
            // Fixed rather than overflowing, so the wrap is the only thing in this modal that scrolls.
            kbqBodyStyle: { height: '1000px', maxHeight: 'none' },
            kbqClassName: 'e2e-modal-flash-tall',
            kbqTitle: 'Tall modal',
            kbqContent: 'Short content',
            kbqOkText: 'Ok',
            injector: this.injector
        });

        this.modal.create({
            kbqWidth: '320px',
            kbqClassName: 'e2e-modal-flash-fitting',
            kbqStyle: { position: 'absolute', top: '16px', left: '16px' },
            kbqTitle: 'Fitting modal',
            kbqContent: 'Short content',
            kbqOkText: 'Ok',
            injector: this.injector
        });

        this.modal.create({
            kbqWidth: '320px',
            kbqBodyStyle: { height: '150px' },
            kbqClassName: 'e2e-modal-flash-overflowing',
            kbqStyle: { position: 'absolute', top: '16px', left: '360px' },
            kbqTitle: 'Scrollable modal',
            kbqContent: E2E_MODAL_SCROLLABLE_CONTENT,
            kbqOkText: 'Ok',
            injector: this.injector
        });
    }
}

const E2E_MODAL_DYNAMIC_PARAGRAPH =
    'In a distributed denial-of-service attack, the incoming traffic flooding the victim originates from many ' +
    'different sources, so simply attempting to block a single source is insufficient.';

@Component({
    selector: 'e2e-modal-dynamic-content-body',
    template: `
        <button data-testid="e2eToggleContent" (click)="toggle()">Toggle content</button>

        @for (paragraph of paragraphs(); track $index) {
            <p>{{ paragraph }}</p>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class E2eModalDynamicContentBody {
    protected readonly paragraphs = signal([E2E_MODAL_DYNAMIC_PARAGRAPH]);

    protected toggle(): void {
        this.paragraphs.update((paragraphs) => Array(paragraphs.length > 1 ? 1 : 10).fill(E2E_MODAL_DYNAMIC_PARAGRAPH));
    }
}

@Component({
    selector: 'e2e-modal-dynamic-content-custom',
    imports: [KbqModalModule, E2eModalDynamicContentBody],
    template: `
        <kbq-modal-title>Custom modal</kbq-modal-title>

        <kbq-modal-body>
            <e2e-modal-dynamic-content-body />
        </kbq-modal-body>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class E2eModalDynamicContentCustom {}

@Component({
    selector: 'e2e-modal-dynamic-content',
    template: `
        <button data-testid="e2eOpenDefaultModal" (click)="openDefault()">Open default modal</button>
        <button data-testid="e2eOpenConfirmModal" (click)="openConfirm()">Open confirm modal</button>
        <button data-testid="e2eOpenCustomModal" (click)="openCustom()">Open custom modal</button>
        <button data-testid="e2eOpenTallModal" (click)="openTall()">Open tall modal</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eModalDynamicContent'
    }
})
export class E2eModalDynamicContent {
    private readonly modal = inject(KbqModalService);

    protected openDefault(): void {
        this.modal.create({
            kbqWidth: '400px',
            kbqTitle: 'Default modal',
            kbqContent: E2eModalDynamicContentBody,
            kbqOkText: 'Ok'
        });
    }

    protected openConfirm(): void {
        this.modal.confirm({
            kbqWidth: '400px',
            kbqContent: E2eModalDynamicContentBody,
            kbqOkText: 'Ok'
        });
    }

    protected openCustom(): void {
        this.modal.open({
            kbqWidth: '400px',
            kbqComponent: E2eModalDynamicContentCustom
        });
    }

    // Unbounded body, so growing content outgrows the viewport and the wrap around the dialog is what
    // starts scrolling.
    protected openTall(): void {
        this.modal.create({
            kbqWidth: '400px',
            kbqBodyStyle: { maxHeight: 'none' },
            kbqTitle: 'Tall modal',
            kbqContent: E2eModalDynamicContentBody,
            kbqOkText: 'Ok'
        });
    }
}
