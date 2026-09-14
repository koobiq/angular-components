import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqSelectModule } from '@koobiq/components/select';

/**
 * @title Select footer
 */
@Component({
    selector: 'select-footer-example',
    imports: [
        KbqSelectModule,
        KbqIconModule,
        KbqLinkModule
    ],
    template: `
        <div class="example-row">
            <div class="kbq-form__label">Button</div>
            <kbq-form-field class="example-select-field">
                <kbq-select [value]="selected">
                    @for (option of options; track option) {
                        <kbq-option [value]="option">{{ option }}</kbq-option>
                    }
                    <kbq-select-footer>
                        <button type="button" kbq-select-footer-item>
                            <i kbq-icon="kbq-plus_16"></i>
                            Button
                        </button>
                    </kbq-select-footer>
                </kbq-select>
            </kbq-form-field>
        </div>

        <div class="example-row">
            <div class="kbq-form__label">Caption</div>
            <kbq-form-field class="example-select-field">
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
            <kbq-form-field class="example-select-field">
                <kbq-select [value]="selected">
                    @for (option of options; track option) {
                        <kbq-option [value]="option">{{ option }}</kbq-option>
                    }
                    <kbq-select-footer>
                        <a
                            class="kbq-link_external"
                            href="https://koobiq.io/en/components/select"
                            target="_blank"
                            kbq-link
                        >
                            <span class="kbq-link__text">Link</span>
                            <i kbq-icon="kbq-north-east_16"></i>
                        </a>
                    </kbq-select-footer>
                </kbq-select>
            </kbq-form-field>
        </div>
    `,
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

        .example-select-field {
            width: 320px;
        }

        .example-select-footer-with-caption {
            color: var(--kbq-foreground-contrast-secondary);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectFooterExample {
    // Enough options to overflow the panel's default 256px — exactly eight rows fit — so the footer is
    // seen doing its job: staying put while the list scrolls under it.
    protected readonly options = Array.from({ length: 10 }).map((_, i) => `Option #${i}`);
    protected readonly selected = this.options[0];
}
