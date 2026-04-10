import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqForm, KbqFormElement } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select no variants
 */
@Component({
    selector: 'select-no-variants-example',
    imports: [
        KbqSelectModule,
        FormsModule,
        KbqIconModule,
        KbqForm,
        KbqFormElement,
        KbqButtonModule
    ],
    template: `
        <form novalidate class="kbq-form-vertical">
            <div class="kbq-form__row">
                <label class="kbq-form__label">Empty select</label>
                <kbq-form-field>
                    <kbq-select>
                        @for (option of options; track option) {
                            <kbq-option [value]="option">{{ option }}</kbq-option>
                        }

                        @if (noOptions) {
                            <kbq-select-no-options>Нет вариантов выбора</kbq-select-no-options>
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
export class SelectNoVariantsExample {
    options: string[];
    noOptions: boolean;

    constructor() {
        this.loadOptions();
    }

    loadOptions() {
        this.options = [];
        this.noOptions = true;
    }
}
