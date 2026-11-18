import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqOptionModule } from '@koobiq/components/core';
import { KbqDd, KbqDl, KbqDt } from '@koobiq/components/dl';
import { KbqFormFieldModule, KbqLabel } from '@koobiq/components/form-field';
import { KbqInlineEditModule } from '@koobiq/components/inline-edit';
import { KbqSelectModule } from '@koobiq/components/select';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Inline edit select basic
 */
@Component({
    selector: 'inline-edit-select-basic-example',
    imports: [
        ReactiveFormsModule,
        KbqInlineEditModule,
        KbqFormFieldModule,
        KbqLabel,
        KbqOptionModule,
        KbqSelectModule,
        KbqDl,
        KbqDt,
        KbqDd
    ],
    template: `
        <div class="example__section">
            <kbq-inline-edit #statusInlineEdit="kbqInlineEdit">
                <kbq-label>{{ t().status }}</kbq-label>

                <div kbqInlineEditViewMode>
                    @if (status.value !== null) {
                        {{ statuses()[status.value] }}
                    } @else {
                        <span kbqInlineEditPlaceholder>{{ notSetLabel }}</span>
                    }
                </div>

                <kbq-form-field kbqInlineEditEditMode [noBorders]="true">
                    <kbq-select
                        panelWidth="auto"
                        [placeholder]="notSetLabel"
                        [formControl]="status"
                        (selectionChange)="statusInlineEdit.commit()"
                    >
                        @for (item of statuses(); track item) {
                            <kbq-option [value]="$index">{{ item }}</kbq-option>
                        }
                    </kbq-select>
                </kbq-form-field>
            </kbq-inline-edit>
        </div>

        <kbq-dl class="example__section" [vertical]="false">
            <kbq-dt>{{ t().priority }}</kbq-dt>
            <kbq-dd>
                <kbq-inline-edit #priorityInlineEdit="kbqInlineEdit">
                    <div kbqInlineEditViewMode>
                        @if (priority.value !== null) {
                            {{ priorities()[priority.value] }}
                        } @else {
                            <span kbqInlineEditPlaceholder>{{ notSetLabel }}</span>
                        }
                    </div>

                    <kbq-form-field kbqInlineEditEditMode [noBorders]="true">
                        <kbq-select
                            panelWidth="auto"
                            [placeholder]="notSetLabel"
                            [formControl]="priority"
                            (selectionChange)="priorityInlineEdit.commit()"
                        >
                            @for (item of priorities(); track item) {
                                <kbq-option [value]="$index">{{ item }}</kbq-option>
                            }
                        </kbq-select>
                    </kbq-form-field>
                </kbq-inline-edit>
            </kbq-dd>
        </kbq-dl>
    `,
    styles: `
        .example__section {
            width: 200px;
        }

        .kbq-dt {
            display: inline-flex;
            align-items: center;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-column layout-align-center-center layout-gap-l'
    }
})
export class InlineEditSelectBasicExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    protected get notSetLabel(): string {
        return this.t().notSpecified;
    }

    protected readonly statuses = computed(() => this.t().statuses);
    protected readonly priorities = computed(() => [...this.t().severities].reverse());

    protected readonly status = new FormControl<number | null>(0);
    protected readonly priority = new FormControl<number | null>(0);
}
