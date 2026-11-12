import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqContentPanelModule } from '@koobiq/components/content-panel';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqModalModule, KbqModalService } from '@koobiq/components/modal';

/**
 * @title Content panel before close
 */
@Component({
    selector: 'content-panel-before-close-example',
    imports: [
        ReactiveFormsModule,
        KbqButtonModule,
        KbqContentPanelModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqModalModule
    ],
    template: `
        <kbq-content-panel-container
            #panel="kbqContentPanelContainer"
            maxWidth="450"
            minWidth="250"
            opened
            width="350"
            [beforeClose]="confirmDiscard"
        >
            <div class="example-content-panel-container__content">
                <button kbq-button (click)="panel.open()">Open</button>
            </div>

            <kbq-content-panel>
                <kbq-content-panel-header>
                    <div kbqContentPanelHeaderTitle>Title</div>
                </kbq-content-panel-header>
                <kbq-content-panel-body>
                    <kbq-form-field>
                        <kbq-label>Name</kbq-label>
                        <input kbqInput [formControl]="name" />
                    </kbq-form-field>
                </kbq-content-panel-body>
            </kbq-content-panel>
        </kbq-content-panel-container>
    `,
    styles: `
        :host {
            display: block;
            height: 200px;
        }

        .example-content-panel-container__content {
            padding: var(--kbq-size-l);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentPanelBeforeCloseExample {
    private readonly modal = inject(KbqModalService);

    protected readonly name = new FormControl('John Smith', { nonNullable: true });

    protected readonly confirmDiscard = (): boolean | Promise<boolean> => {
        if (this.name.pristine) return true;

        return new Promise((resolve) => {
            this.modal.confirm({
                kbqAriaLabel: 'Discard changes',
                kbqContent: 'Discard unsaved changes?',
                kbqOkText: 'Discard',
                kbqCancelText: 'Keep editing',
                kbqOkClick: () => {
                    this.name.reset();
                    resolve(true);
                },
                kbqCancelClick: () => resolve(false)
            });
        });
    };
}
