import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqContentPanelModule } from '@koobiq/components/content-panel';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqModalModule, KbqModalService, ModalSize } from '@koobiq/components/modal';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

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
                <button kbq-button (click)="panel.open()">{{ t().open }}</button>
            </div>

            <kbq-content-panel>
                <kbq-content-panel-header>
                    <div kbqContentPanelHeaderTitle>{{ t().title }}</div>
                </kbq-content-panel-header>
                <kbq-content-panel-body>
                    <kbq-form-field>
                        <kbq-label>{{ t().name }}</kbq-label>
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

    protected readonly t = injectTranslation(TRANSLATIONS);

    protected readonly name = new FormControl('John Smith', { nonNullable: true });

    protected readonly confirmDiscard = (): Promise<boolean> =>
        new Promise((resolve) => {
            const modal = this.modal.create({
                kbqAriaLabel: this.t().discardChangesLabel,
                kbqSize: ModalSize.Small,
                kbqContent: this.t().discardChangesContent,
                kbqFooter: [
                    {
                        label: this.t().discard,
                        type: KbqComponentColors.Contrast,
                        onClick: () => {
                            this.name.reset();
                            resolve(true);
                            modal.close();
                        }
                    },
                    // The focus goes to the choice that loses nothing.
                    { label: this.t().keepEditing, autoFocus: true, onClick: () => modal.close() }
                ]
            });

            // Keep editing, ESCAPE and the close button: a Discard has already answered.
            modal.afterClose.subscribe(() => resolve(false));
        });
}
