import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqOptionModule } from '@koobiq/components/core';
import { KbqFormFieldModule, KbqLabel } from '@koobiq/components/form-field';
import { KbqInlineEditModule } from '@koobiq/components/inline-edit';
import { KbqSelectModule } from '@koobiq/components/select';

const COMMENTS: string[] = [
    'Issue resolved after restarting the affected service. No further action required.',
    'Root cause identified as a misconfigured environment variable, fixed and redeployed.',
    'Duplicate of an existing issue, closing without further changes.',
    'Waiting on additional information from the reporter before further diagnosis.'
];

/**
 * @title Inline edit select multiline
 */
@Component({
    selector: 'inline-edit-select-multiline-example',
    imports: [
        ReactiveFormsModule,
        KbqInlineEditModule,
        KbqFormFieldModule,
        KbqLabel,
        KbqOptionModule,
        KbqSelectModule
    ],
    template: `
        <div style="width: 280px">
            <kbq-inline-edit #inlineEdit="kbqInlineEdit">
                <kbq-label>Resolution comment</kbq-label>

                <div kbqInlineEditViewMode>
                    @if (control.value) {
                        {{ control.value }}
                    } @else {
                        <span kbqInlineEditPlaceholder>{{ notSetLabel }}</span>
                    }
                </div>

                <kbq-form-field kbqInlineEditEditMode [noBorders]="true">
                    <kbq-select
                        panelWidth="auto"
                        [panelClass]="'example-inline-select-multiline__options'"
                        [placeholder]="notSetLabel"
                        [formControl]="control"
                        (selectionChange)="inlineEdit.commit()"
                    >
                        <kbq-option class="example-inline-select-multiline__empty-option" [value]="null">
                            {{ notSetLabel }}
                        </kbq-option>
                        @for (comment of comments; track comment) {
                            <kbq-option [value]="comment">{{ comment }}</kbq-option>
                        }
                    </kbq-select>
                </kbq-form-field>
            </kbq-inline-edit>
        </div>
    `,
    styles: `
        ::ng-deep .example-inline-select-multiline__options .kbq-option-text {
            white-space: normal;
            overflow-wrap: break-word;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-column layout-align-center-center'
    }
})
export class InlineEditSelectMultilineExample {
    protected readonly notSetLabel = 'Not specified';

    protected readonly comments = COMMENTS;

    protected readonly control = new FormControl<string | null>(COMMENTS[0]);
}
