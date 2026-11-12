import { ChangeDetectionStrategy, Component, inject, Injectable, Injector } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqModalModule, KbqModalRef, KbqModalService } from '@koobiq/components/modal';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

@Injectable()
export class ComponentLevelService {
    action() {
        console.log('Hello world!');
    }
}

@Component({
    selector: 'custom-modal',
    imports: [
        KbqModalModule,
        KbqButtonModule
    ],
    template: `
        <kbq-modal-title>{{ text().title }}</kbq-modal-title>
        <kbq-modal-body>{{ text().subtitle }}</kbq-modal-body>

        <div kbq-modal-footer>
            <button kbq-button [color]="'contrast'" (click)="customService.action()">
                Call method from injected service
            </button>
            <button kbq-button autofocus (click)="destroyModal('close')">{{ text().close }}</button>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomModalComponent extends BaseLocalizedExample<ExampleText> {
    private readonly modalRef = inject(KbqModalRef);
    protected readonly customService = inject(ComponentLevelService);

    destroyModal(action: 'save' | 'close') {
        this.modalRef.destroy(action);
    }

    constructor() {
        super(TEXT);
    }
}

/**
 * @title Modal component With Injector
 */
@Component({
    selector: 'modal-component-with-injector-example',
    imports: [KbqButtonModule],
    template: `
        <button kbq-button (click)="openModal()">{{ text().openModal }}</button>
    `,
    providers: [ComponentLevelService],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponentWithInjectorExample extends BaseLocalizedExample<ExampleText> {
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

    constructor() {
        super(TEXT);
    }
}
