import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqForm, KbqFormElement } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLink } from '@koobiq/components/link';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select add new option
 */
@Component({
    selector: 'select-add-new-option-example',
    imports: [
        KbqSelectModule,
        FormsModule,
        KbqIconModule,
        KbqButtonModule,
        KbqForm,
        KbqFormElement,
        KbqLink
    ],
    template: `
        <form novalidate class="kbq-form-vertical">
            <div class="kbq-form__row">
                <label class="kbq-form__label">Login account</label>
                <kbq-form-field class="kbq-form__control">
                    <kbq-select [value]="selected">
                        @for (option of options; track option) {
                            <kbq-option [value]="option">{{ option }}</kbq-option>
                        }
                    </kbq-select>
                </kbq-form-field>
            </div>

            <div class="kbq-form__row">
                <div>Account for privilege escalation</div>
                <div class="layout-padding-top-3xs" [style.color]="'var(--kbq-foreground-contrast-secondary)'">
                    There are no suitable accounts of this type (Terminal) in Mega App
                </div>
                <div class="layout-padding-top-xs">
                    <span kbq-link pseudo>
                        <i kbq-icon="kbq-plus_16"></i>
                        New Account
                    </span>
                </div>
            </div>
        </form>
    `,
    styles: `
        .kbq-form-vertical {
            width: 320px;
        }
    `,
    host: {
        class: 'layout-margin-5xl layout-column layout-align-center-center'
    },
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectAddNewOptionExample {
    readonly options = [
        'admin / @dm1n',
        'root / P@ssw0rd',
        'user / us3R'
    ];
    readonly selected = this.options[1];
}
