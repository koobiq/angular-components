import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqForm, KbqFormElement } from '@koobiq/components/core';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select loading error (custom)
 */
@Component({
    selector: 'select-loading-error-custom-example',
    imports: [
        KbqSelectModule,
        FormsModule,
        KbqIconModule,
        KbqForm,
        KbqFormElement,
        KbqButtonModule,
        KbqEmptyStateModule
    ],
    template: `
        <form novalidate class="kbq-form-vertical">
            <div class="kbq-form__row">
                <label class="kbq-form__label">Custom Error State</label>
                <kbq-form-field>
                    <kbq-select>
                        @for (option of options; track option) {
                            <kbq-option [value]="option">{{ option }}</kbq-option>
                        }

                        @if (error) {
                            <kbq-empty-state class="layout-margin-top-l layout-margin-bottom-3xl" [errorColor]="true">
                                <i
                                    kbq-empty-state-icon
                                    kbq-icon-item="kbq-triangle-exclamation_16"
                                    [big]="true"
                                    [color]="'contrast'"
                                    [fade]="true"
                                ></i>
                                <div kbq-empty-state-text>Failed to load the location list</div>
                                <div kbq-empty-state-actions>
                                    <button kbq-button [color]="'theme'" [kbqStyle]="'transparent'">Try Again</button>
                                </div>
                            </kbq-empty-state>
                        }
                    </kbq-select>
                </kbq-form-field>
            </div>
        </form>
    `,
    styles: `
        .kbq-form-field {
            width: 320px;
        }
    `,
    host: {
        class: 'layout-margin-5xl layout-column layout-align-center-center'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectLoadingErrorCustomExample {
    options: string[];
    error: boolean;

    constructor() {
        this.loadOptions();
    }

    loadOptions() {
        this.options = [];
        this.error = true;
    }
}
