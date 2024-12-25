import { ChangeDetectionStrategy, Component, inject, TemplateRef } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqModalModule, KbqModalRef, KbqModalService } from '@koobiq/components/modal';

/**
 * @title Modal template
 */
@Component({
    standalone: true,
    selector: 'modal-template-example',
    imports: [
        KbqModalModule,
        KbqButtonModule
    ],
    template: `
        <button (click)="createModal(title, content, footer)" kbq-button>Open Modal</button>

        <ng-template #title>DoS attack</ng-template>

        <ng-template #content>
            In computing, a denial-of-service attack (DoS attack) is a cyber-attack in which the perpetrator seeks to
            make a machine or network resource unavailable to its intended users by temporarily or indefinitely
            disrupting services of a host connected to a network.
        </ng-template>

        <ng-template #footer>
            <div class="layout-row flex-grow layout-align-space-between">
                <button (click)="destroyModal()" kbq-button>Add. action</button>

                <div>
                    <button
                        class="layout-margin-right-m"
                        [color]="'contrast'"
                        (click)="destroyModal()"
                        kbq-button
                        kbq-modal-main-action
                    >
                        Save
                    </button>
                    <button (click)="destroyModal()" kbq-button>Cancel</button>
                </div>
            </div>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalTemplateExample {
    private readonly modalService = inject(KbqModalService);

    modalRef: KbqModalRef;

    createModal(kbqTitle: TemplateRef<object>, kbqContent: TemplateRef<object>, kbqFooter: TemplateRef<object>): void {
        this.modalRef = this.modalService.create({
            kbqTitle,
            kbqContent,
            kbqFooter,
            kbqOnOk: () => console.log('OK')
        });
    }

    destroyModal(): void {
        this.modalRef.triggerOk();
    }
}
