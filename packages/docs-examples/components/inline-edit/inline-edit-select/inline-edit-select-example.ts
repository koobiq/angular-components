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
        <div style="width: 200px">
            <kbq-inline-edit
                #inlineEdit="kbqInlineEdit"
                #selectOrigin="kbqSelectOrigin"
                kbqSelectOrigin
                class="example-inline-select__host"
                [overlayPanelClass]="'example-inline-select__panel'"
            >
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
                        [kbqSelectConnectedTo]="selectOrigin"
                        (selectionChange)="inlineEdit.commit()"
                    >
                        <!-- Left empty on purpose: the currently selected user is already shown in
                             view mode, so the trigger itself doesn't need to render kbq-username again
                             (which would otherwise have to be re-constrained to avoid overflowing). -->
                        <div kbq-select-matcher></div>

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
        </div>
    `,
    styles: `
        .example-inline-select__view {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        /* The following rules reach into content rendered by kbq-inline-edit/kbq-select inside
           the CDK overlay, which lives outside this component's own DOM subtree - a portal, not a
           child of this component's host, so CSS custom properties set on the host don't cascade
           into it and it needs its own background rather than inheriting one. */

        /* Gives the host itself the same "active" look while the panel is open, for the sliver of
           host (e.g. the label row) that remains visible around the portaled panel. */
        ::ng-deep .example-inline-select__host.kbq-inline-edit_edit {
            --kbq-inline-edit-background: var(--kbq-states-background-transparent-active);
        }

        /* kbq-inline-edit__view-content keeps rendering behind the panel even in edit mode (it's
           what the panel's position/size is measured against), so the control-container needs an
           opaque background of its own to mask it - transparent here would let the old value's
           text show through underneath. */
        ::ng-deep .example-inline-select__panel .kbq-inline-edit__control-container {
            display: none;
            box-shadow: none;
            background-color: var(--kbq-states-background-transparent-active);
            padding: var(--kbq-inline-edit-padding-vertical) var(--kbq-inline-edit-padding-horizontal);
        }

        /* The form-field/select fill that box edge-to-edge with no padding or background of their
           own, so the text sits at the same offset as in view mode, nothing shifts when the panel
           opens, and the control-container's background above shows through uniformly instead of
           the form-field's own opaque default poking through as a mismatched patch. */
        ::ng-deep .example-inline-select__panel .kbq-form-field__container {
            padding: 0 !important;
            background-color: transparent !important;
            min-height: unset;
        }

        ::ng-deep .example-inline-select__panel .kbq-form-field__infix {
            padding-left: 0 !important;
        }

        ::ng-deep .example-inline-select__panel .kbq-select__matcher {
            padding: 0 !important;
        }

        ::ng-deep .example-inline-select__panel .kbq-select__arrow-wrapper {
            visibility: hidden;
        }

        /* kbq-username isn't a <span>, so the select's own "shrink the matcher content" rule
           (which only targets a direct span child) doesn't reach it - constrain it explicitly so a
           long name wraps instead of overflowing the option row. */
        ::ng-deep .example-inline-select__options .kbq-option-text {
            white-space: normal;
            overflow-wrap: break-word;
        }

        ::ng-deep .example-inline-select__options .kbq-option-text > kbq-username {
            width: 100%;
            min-width: 0;
        }

        ::ng-deep .example-inline-select__options .kbq-username__primary,
        ::ng-deep .example-inline-select__options .kbq-username__secondary {
            white-space: normal;
            overflow-wrap: break-word;
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
