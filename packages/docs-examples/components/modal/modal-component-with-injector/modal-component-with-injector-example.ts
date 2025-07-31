import { ChangeDetectionStrategy, Component, inject, Injectable, Injector } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqModalModule, KbqModalRef, KbqModalService } from '@koobiq/components/modal';

@Injectable()
export class ComponentLevelService {
    action() {
        console.log('Hello world!');
    }
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
            <button kbq-button [color]="'contrast'" (click)="customService.action()">
                Call method from injected service
            </button>
            <button kbq-button autofocus (click)="destroyModal('close')">Close</button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomModalComponent {
    private readonly modalRef = inject(KbqModalRef);
    protected readonly customService = inject(ComponentLevelService);

    destroyModal(action: 'save' | 'close') {
        this.modalRef.destroy(action);
    }
}

/**
 * @title Modal component With Injector
 */
@Component({
    standalone: true,
    selector: 'modal-component-with-injector-example',
    imports: [
        KbqModalModule,
        KbqButtonModule
    ],
    template: `
        <button kbq-button (click)="openModal()">Open Modal</button>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [ComponentLevelService]
})
export class ModalComponentWithInjectorExample {
    private readonly modalService = inject(KbqModalService);
    private readonly injector = inject(Injector);

    modalRef: KbqModalRef<CustomModalComponent, 'save' | 'close'>;

    openModal(): void {
        this.modalRef = this.modalService.open({
            kbqComponent: CustomModalComponent,
            // provide injector, so `ComponentLevelService` will be accessible inside `CustomModalComponent`
            injector: this.injector
        });

        this.modalRef.afterOpen.subscribe(() => {
            console.log('[afterOpen] emitted!');
        });

        this.modalRef.afterClose.subscribe((action) => {
            console.log(`[afterClose] emitted, chosen action: ${action}`);
        });
    }
}
