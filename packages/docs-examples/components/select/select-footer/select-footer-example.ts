import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select footer
 */
@Component({
    standalone: true,
    imports: [
        KbqFormFieldModule,
        KbqSelectModule,
        KbqButtonModule,
        KbqIconModule,
        KbqLinkModule
    ],
    selector: 'select-footer-example',
    template: `
        <div class="example-row">
            <div class="kbq-form__label">Button</div>
            <kbq-form-field>
                <kbq-select [value]="selected">
                    @for (option of options; track option) {
                        <kbq-option [value]="option">{{ option }}</kbq-option>
                    }
                    <kbq-select-footer class="example-select-footer-with-button">
                        <button color="contrast" kbqStyle="transparent" kbq-button>
                            <i kbq-icon="kbq-plus_16"></i>
                            Button
                        </button>
                    </kbq-select-footer>
                </kbq-select>
            </kbq-form-field>
        </div>

        <div class="example-row">
            <div class="kbq-form__label">Caption</div>
            <kbq-form-field>
                <kbq-select [value]="selected">
                    @for (option of options; track option) {
                        <kbq-option [value]="option">{{ option }}</kbq-option>
                    }
                    <kbq-select-footer class="example-select-footer-with-caption">Caption ⌥+⌘+F</kbq-select-footer>
                </kbq-select>
            </kbq-form-field>
        </div>

        <div class="example-row">
            <div class="kbq-form__label">Link</div>
            <kbq-form-field>
                <kbq-select [value]="selected">
                    @for (option of options; track option) {
                        <kbq-option [value]="option">{{ option }}</kbq-option>
                    }
                    <kbq-select-footer>
                        <a class="kbq-link_external" kbq-link>
                            <span class="kbq-link__text">Link</span>
                            <i kbq-icon="kbq-north-east_16"></i>
                        </a>
                    </kbq-select-footer>
                </kbq-select>
            </kbq-form-field>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: `
        .example-row {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: var(--kbq-size-xxl);
            width: 400px;
            margin: 0 auto;
            padding: var(--kbq-size-l);
        }

        .kbq-form-field {
            width: 320px;
        }

        .kbq-form__label {
            color: var(--kbq-foreground-contrast-secondary);
        }

        .example-select-footer-with-button {
            padding-left: var(--kbq-size-xxs) !important;
        }

        .example-select-footer-with-caption {
            color: var(--kbq-foreground-contrast-secondary);
        }
    `
})
export class SelectFooterExample {
    readonly options = Array.from({ length: 5 }).map((_, i) => `Option #${i}`);
    readonly selected = this.options[0];
}
