import { ChangeDetectionStrategy, Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqLoaderOverlayModule } from '@koobiq/components/loader-overlay';
import { KbqModalModule, KbqModalService } from '@koobiq/components/modal';

/**
 * @title Loader-overlay card
 */
@Component({
    selector: 'loader-overlay-card-example',
    imports: [KbqButtonModule, KbqLoaderOverlayModule, KbqModalModule, KbqFormFieldModule, KbqInputModule],
    template: `
        <button kbq-button (click)="openModal()">Open modal with loader</button>

        <ng-template #modalContent>
            <div class="example__modal-content">
                text text text text text text text text text text text text text text text text text text text text text
                text text text text text text text text text

                <kbq-form-field class="layout-margin-top-l">
                    <kbq-label>Label</kbq-label>
                    <input kbqInput placeholder="Click on the label for auto focus" />
                </kbq-form-field>

                <kbq-form-field class="layout-margin-top-l">
                    <kbq-label>Label</kbq-label>
                    <input kbqInput placeholder="Click on the label for auto focus" />
                </kbq-form-field>

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
