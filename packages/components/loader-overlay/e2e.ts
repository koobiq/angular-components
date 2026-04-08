import { ChangeDetectionStrategy, Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqLoaderOverlayModule } from '@koobiq/components/loader-overlay';
import { KbqModalModule, KbqModalService, ModalSize } from '@koobiq/components/modal';

@Component({
    selector: 'e2e-loader-overlay-states',
    imports: [KbqLoaderOverlayModule],
    template: `
        <!-- Base -->
        <div>
            Content
            <kbq-loader-overlay size="compact" />
        </div>
        <div>
            Content
            <kbq-loader-overlay size="normal" />
        </div>
        <div>
            Content
            <kbq-loader-overlay size="big" />
        </div>
        <div>
            Content
            <kbq-loader-overlay size="big" [transparent]="false" />
        </div>

        <!-- With text -->
        <div>
            Content
            <kbq-loader-overlay text="Text" size="compact" />
        </div>
        <div>
            Content
            <kbq-loader-overlay text="Text" size="normal" />
        </div>
        <div>
            Content
            <kbq-loader-overlay text="Text" size="big" />
        </div>
        <div>
            Content
            <kbq-loader-overlay size="big" text="Text" [transparent]="false" />
        </div>

        <!-- With text and caption -->
        <div>
            Content
            <kbq-loader-overlay text="Text" size="compact" caption="Caption" />
        </div>
        <div>
            Content
            <kbq-loader-overlay text="Text" size="normal" caption="Caption" />
        </div>
        <div>
            Content
            <kbq-loader-overlay text="Text" size="big" caption="Caption" />
        </div>
        <div>
            Content
            <kbq-loader-overlay size="big" text="Text" caption="Caption" [transparent]="false" />
        </div>
    `,
    styles: `
        :host {
            display: inline-grid;
            grid-template-columns: repeat(4, 1fr);
            gap: var(--kbq-size-xxs);
        }

        div {
            width: 170px;
            height: 170px;
            border: 1px dashed;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'data-testid': 'e2eLoaderOverlayStates'
    }
})
export class E2eLoaderOverlayStates {}

@Component({
    selector: 'e2e-loader-overlay-on-background',
    imports: [KbqButtonModule, KbqLoaderOverlayModule, KbqModalModule],
    template: `
        <button data-testid="e2eOpenModalWithLoader" (click)="open()">Open modal</button>

        <ng-template #modalContent>
            <div class="layout-padding-xl">
                text text text text text text text text text text text text text text text text text text text text text
                text text text text text text text text text text
                <kbq-loader-overlay text="Loading data..." size="compact" [card]="true" />
            </div>
        </ng-template>
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
        'data-testid': 'e2eLoaderOverlayOnBackground'
    }
})
export class E2eLoaderOverlayCard {
    @ViewChild('modalContent') private readonly modalContent: TemplateRef<any>;

    private readonly modal = inject(KbqModalService);

    protected open(): void {
        this.modal.create({
            kbqTitle: 'Loading data',
            kbqContent: this.modalContent,
            kbqOkText: 'Close',
            kbqSize: ModalSize.Small
        });
    }
}
