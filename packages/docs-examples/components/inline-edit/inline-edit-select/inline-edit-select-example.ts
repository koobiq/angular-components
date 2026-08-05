import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqOptionModule } from '@koobiq/components/core';
import { KbqFormFieldModule, KbqLabel } from '@koobiq/components/form-field';
import { KbqInlineEditModule } from '@koobiq/components/inline-edit';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqUserInfo, KbqUsername } from '@koobiq/components/username';

const USERS: KbqUserInfo[] = [
    {
        firstName: 'Ivan',
        lastName: 'Petrov',
        login: 'ipetrov',
        site: 'Engineering'
    },
    { firstName: 'Maria', lastName: 'Sidorova', login: 'msidorova', site: 'Customer support' },
    { firstName: 'Alexey', lastName: 'Smirnov', login: 'asmirnov', site: 'Information security' },
    { firstName: 'Olga', lastName: 'Kuznetsova', login: 'okuznetsova', site: 'Marketing' }
];

/**
 * @title Inline edit select
 */
@Component({
    selector: 'inline-edit-select-example',
    imports: [
        ReactiveFormsModule,
        KbqInlineEditModule,
        KbqFormFieldModule,
        KbqLabel,
        KbqOptionModule,
        KbqSelectModule,
        KbqUsername
    ],
    template: `
        <div style="width: 250px">
            <kbq-inline-edit #inlineEdit="kbqInlineEdit">
                <kbq-label>Assignee</kbq-label>

                <div kbqInlineEditViewMode class="example-inline-select__view">
                    @if (control.value) {
                        <kbq-username isCompact [userInfo]="control.value" />
                    } @else {
                        <span kbqInlineEditPlaceholder>{{ notSetLabel }}</span>
                    }
                </div>
                <kbq-form-field kbqInlineEditEditMode [noBorders]="true">
                    <kbq-select
                        panelWidth="auto"
                        [panelClass]="'example-inline-select__options'"
                        [placeholder]="notSetLabel"
                        [formControl]="control"
                        (selectionChange)="inlineEdit.commit()"
                    >
                        <kbq-option class="example-inline-select__empty-option" [value]="null">
                            {{ notSetLabel }}
                        </kbq-option>
                        @for (user of users; track user) {
                            <kbq-option [value]="user">
                                <kbq-username isCompact [userInfo]="user" />
                            </kbq-option>
                        }
                    </kbq-select>
                </kbq-form-field>
            </kbq-inline-edit>
        </div>
    `,
    styles: `
        .example-inline-select__view {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-column layout-align-center-center'
    }
})
export class InlineEditSelectExample {
    protected readonly notSetLabel = 'Not specified';

    protected readonly users = USERS;

    protected readonly control = new FormControl<KbqUserInfo | null>(this.users[0]);
}
