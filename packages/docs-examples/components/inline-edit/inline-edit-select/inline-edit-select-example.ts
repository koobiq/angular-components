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
        lastName: 'Petrov Petrov Petrov Petrov Petrov Petrov Petrov Petrov Petrov Petrov',
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
        <kbq-inline-edit #inlineEdit="kbqInlineEdit" [overlayPanelClass]="'example-inline-select__panel'">
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
                    class="example-inline-select__select"
                    panelWidth="auto"
                    [panelClass]="'example-inline-select__options'"
                    [placeholder]="notSetLabel"
                    [formControl]="control"
                    (selectionChange)="inlineEdit.commit()"
                >
                    @if (control.value) {
                        <ng-container kbq-select-trigger>
                            <kbq-username isCompact [userInfo]="control.value" />
                        </ng-container>
                    }

                    <kbq-option class="example-inline-select__empty-option" [value]="null">
                        {{ notSetLabel }}
                    </kbq-option>
                    @for (user of users; track user) {
                        <kbq-option [value]="user">
                            <kbq-username [userInfo]="user" />
                        </kbq-option>
                    }
                </kbq-select>
            </kbq-form-field>
        </kbq-inline-edit>
    `,
    styles: `
        .example-inline-select__view {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        /* The following rules reach into content rendered by kbq-inline-edit/kbq-select inside
           the CDK overlay, which lives outside this component's own DOM subtree. */

        /* View mode already gets hover styling from kbq-inline-edit itself (transparent-hover
           background). While editing, the trigger has no border of its own, so give it the same
           "active" background a dropdown trigger gets while its panel is open, otherwise the field
           looks empty. */
        ::ng-deep .example-inline-select__panel .kbq-inline-edit__control-container {
            box-shadow: none;
        }

        ::ng-deep .example-inline-select__panel .kbq-form-field__container {
            background-color: var(--kbq-states-background-transparent-active) !important;
            padding-left: 0;
            padding-right: 0;
            min-height: unset;
        }

        ::ng-deep .example-inline-select__panel .kbq-form-field__container .kbq-select__arrow-wrapper {
            visibility: hidden;
        }

        ::ng-deep .example-inline-select__options .kbq-option {
            align-items: flex-start;
            min-height: unset;
            padding-top: var(--kbq-size-xs);
            padding-bottom: var(--kbq-size-xs);
        }

        ::ng-deep .example-inline-select__options .kbq-option-text {
            white-space: normal;
            overflow-wrap: break-word;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InlineEditSelectExample {
    protected readonly notSetLabel = 'Not specified';

    protected readonly users = USERS;

    protected readonly control = new FormControl<KbqUserInfo | null>(this.users[0]);
}
