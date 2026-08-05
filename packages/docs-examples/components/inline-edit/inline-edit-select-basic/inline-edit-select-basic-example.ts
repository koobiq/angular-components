import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqOptionModule } from '@koobiq/components/core';
import { KbqDlModule } from '@koobiq/components/dl';
import { KbqFormFieldModule, KbqLabel } from '@koobiq/components/form-field';
import { KbqInlineEditModule } from '@koobiq/components/inline-edit';
import { KbqSelectModule } from '@koobiq/components/select';

const STATUSES: string[] = ['Open', 'In progress', 'Resolved', 'Closed'];
const PRIORITIES: string[] = ['Low', 'Medium', 'High', 'Critical'];

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
        KbqDlModule
    ],
    template: `
        <div class="example__section">
            <kbq-inline-edit #statusInlineEdit="kbqInlineEdit">
                <kbq-label>Status</kbq-label>

                <div kbqInlineEditViewMode>
                    @if (status.value) {
                        {{ status.value }}
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
                        @for (item of statuses; track item) {
                            <kbq-option [value]="item">{{ item }}</kbq-option>
                        }
                    </kbq-select>
                </kbq-form-field>
            </kbq-inline-edit>
        </div>

        <kbq-dl class="example__section" [vertical]="false">
            <kbq-dt>Priority</kbq-dt>
            <kbq-dd>
                <kbq-inline-edit #priorityInlineEdit="kbqInlineEdit">
                    <div kbqInlineEditViewMode>
                        @if (priority.value) {
                            {{ priority.value }}
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
                            @for (item of priorities; track item) {
                                <kbq-option [value]="item">{{ item }}</kbq-option>
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
    protected readonly notSetLabel = 'Not specified';

    protected readonly statuses = STATUSES;
    protected readonly priorities = PRIORITIES;

    protected readonly status = new FormControl<string | null>(STATUSES[0]);
    protected readonly priority = new FormControl<string | null>(PRIORITIES[0]);
}
