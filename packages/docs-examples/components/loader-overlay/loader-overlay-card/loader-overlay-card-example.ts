import { ChangeDetectionStrategy, Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqLoaderOverlayModule } from '@koobiq/components/loader-overlay';
import { KbqModalModule, KbqModalService } from '@koobiq/components/modal';

/**
 * @title Loader-overlay on background
 */
@Component({
    selector: 'loader-overlay-on-background-example',
    imports: [KbqButtonModule, KbqLoaderOverlayModule, KbqModalModule],
    template: `
        <button kbq-button (click)="openModal()">Open modal with loader</button>

        <ng-template #modalContent>
            <div class="example__modal-content">
                text text text text text text text text text text text text text text text text text text text text text
                text text text text text text text text text
                <kbq-loader-overlay text="Loading data..." [card]="true" />
            </div>
        </ng-template>
    `,
    styles: `
        .example__modal-content {
            height: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderOverlayCardExample {
    @ViewChild('modalContent') private readonly modalContent: TemplateRef<any>;

    private readonly modalService = inject(KbqModalService);

    openModal(): void {
        this.modalService.create({
            kbqTitle: 'Loading data',
            kbqContent: this.modalContent,
            kbqOkText: 'Close'
        });
    }
}
