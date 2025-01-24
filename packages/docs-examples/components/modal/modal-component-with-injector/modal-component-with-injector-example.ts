import { ChangeDetectionStrategy, Component, inject, Injectable, Injector } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqModalModule, KbqModalRef, KbqModalService } from '@koobiq/components/modal';

@Injectable()
export class CustomService {
    action() {
        console.log('Hello world!');
    }
}

@Component({
    standalone: true,
    selector: 'custom-component',
    imports: [
        KbqButtonModule
    ],
    template: `
        <button [color]="'contrast'" (click)="customService.action()" kbq-button>Call injected service method</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomComponent {
    protected readonly customService = inject(CustomService);
}

@Component({
    standalone: true,
    selector: 'custom-modal',
    imports: [
        KbqModalModule,
        KbqButtonModule
    ],
    template: `
        <kbq-modal-title>title</kbq-modal-title>

        <kbq-modal-body>subtitle</kbq-modal-body>

        <div kbq-modal-footer>
            <button [color]="'contrast'" (click)="customService.action()" kbq-button>
                Call injected service method
            </button>
            <button (click)="destroyModal('close')" kbq-button autofocus>Close</button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomModalComponent {
    private readonly modalRef = inject(KbqModalRef);
    protected readonly customService = inject(CustomService);

    destroyModal(action: 'save' | 'close') {
        this.modalRef.destroy(action);
    }
}

/**
 * @title Modal component With Injectors
 */
@Component({
    standalone: true,
    selector: 'modal-component-with-injector-example',
    imports: [
        KbqModalModule,
        KbqButtonModule,
        CustomComponent
    ],
    template: `
        <button (click)="openModal()" kbq-button>Open Modal</button>
        <custom-component />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [CustomService]
})
export class ModalComponentWithInjectorExample {
    private readonly modalService = inject(KbqModalService);
    private readonly injector = inject(Injector);

    modalRef: KbqModalRef<CustomModalComponent, 'save' | 'close'>;

    openModal(): void {
        this.modalRef = this.modalService.open({
            kbqComponent: CustomModalComponent,
            injector: this.injector,
            kbqComponentParams: {
                title: 'DoS attack',
                subtitle:
                    'In computing, a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator seeks to make a machine or network resource unavailable to its intended users by temporarily or indefinitely disrupting services of a host connected to a network.'
            }
        });

        this.modalRef.afterOpen.subscribe(() => {
            console.log('[afterOpen] emitted!');
        });

        this.modalRef.afterClose.subscribe((action) => {
            console.log(`[afterClose] emitted, chosen action: ${action}`);
        });
    }
}
