import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, viewChildren } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { kbqInjectNativeElement, KbqOptionModule } from '@koobiq/components/core';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqFormFieldModule, KbqLabel } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqTextareaModule } from '@koobiq/components/textarea';
import { KbqInlineEdit } from './inline-edit';
import { KbqInlineEditModule } from './module';

@Component({
    selector: 'e2e-inline-edit-states',
    imports: [
        KbqInlineEditModule,
        FormsModule,
        KbqInputModule,
        NgTemplateOutlet,
        KbqButtonModule
    ],
    template: `
        <button kbq-button data-testid="e2eInlineEditOpenTrigger" (click)="openInlineEdits()">open inline edits</button>
        <button kbq-button data-testid="e2eInlineEditFocusTrigger" (click)="focusInlineEdits()">
            focus inline edits
        </button>

        <div
            class="layout-column layout-gap-xxl layout-margin-bottom-6xl flex layout-padding-3xs"
            data-testid="e2eInlineEditList"
        >
            <kbq-inline-edit>
                <div class="example-inline-text" kbqInlineEditViewMode>
                    <ng-container *ngTemplateOutlet="view; context: { $implicit: { value: '' } }" />
                </div>
                <kbq-form-field kbqInlineEditEditMode>
                    <input kbqInput [placeholder]="'placeholder'" />
                </kbq-form-field>
            </kbq-inline-edit>

            <kbq-inline-edit>
                <div class="example-inline-text" kbqInlineEditViewMode>
                    <ng-container *ngTemplateOutlet="view; context: { $implicit: { value: 'value' } }" />
                </div>
                <kbq-form-field kbqInlineEditEditMode>
                    <input kbqInput [placeholder]="'placeholder'" [value]="'value'" />
                </kbq-form-field>
            </kbq-inline-edit>

            <kbq-inline-edit>
                <kbq-label>Label</kbq-label>

                <div class="example-inline-text" kbqInlineEditViewMode>
                    <ng-container *ngTemplateOutlet="view; context: { $implicit: { value: 'value' } }" />
                </div>
                <kbq-form-field kbqInlineEditEditMode>
                    <input kbqInput [placeholder]="'placeholder'" [value]="'value'" />
                </kbq-form-field>
            </kbq-inline-edit>

            <kbq-inline-edit showActions>
                <div class="example-inline-text" kbqInlineEditViewMode>
                    <ng-container *ngTemplateOutlet="view; context: { $implicit: { value: 'value' } }" />
                </div>
                <kbq-form-field kbqInlineEditEditMode>
                    <input kbqInput [placeholder]="'placeholder'" [value]="'value'" />
                </kbq-form-field>
            </kbq-inline-edit>
        </div>

        <ng-template #view let-control>
            @if (!control.value) {
                <span kbqInlineEditPlaceholder>placeholder</span>
            } @else {
                {{ control.value }}
            }
        </ng-template>
    `,
    styles: `
        :host {
            max-width: 500px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-top-l layout-row',
        'data-testid': 'e2eInlineEditStates'
    }
})
export class E2eInlineEditStates {
    protected readonly inlineEditList = viewChildren(KbqInlineEdit);
    private readonly nativeElement = kbqInjectNativeElement();

    openInlineEdits() {
        this.inlineEditList().forEach((inlineEdit) => inlineEdit.toggleMode());
    }

    focusInlineEdits() {
        this.nativeElement
            .querySelectorAll<HTMLElement>('.kbq-inline-edit')
            .forEach((focusContainer) => focusContainer.classList.add('cdk-focused', 'cdk-keyboard-focused'));
    }
}

@Component({
    selector: 'e2e-inline-edit-truncation',
    imports: [
        KbqInlineEditModule,
        KbqInputModule,
        KbqButtonModule,
        KbqDropdownModule,
        KbqIconModule
    ],
    template: `
        <div class="layout-column layout-gap-xxl" data-testid="e2eInlineEditTruncationList">
            <kbq-inline-edit>
                <div class="truncated-text" kbqInlineEditViewMode>Long text value that should be truncated</div>
                <kbq-form-field kbqInlineEditEditMode>
                    <input kbqInput [value]="'Long text value that should be truncated'" />
                </kbq-form-field>
            </kbq-inline-edit>

            <kbq-inline-edit>
                <kbq-label>Label</kbq-label>
                <div class="truncated-text" kbqInlineEditViewMode>Long text value that should be truncated</div>
                <kbq-form-field kbqInlineEditEditMode>
                    <input kbqInput [value]="'Long text value that should be truncated'" />
                </kbq-form-field>
            </kbq-inline-edit>

            <kbq-inline-edit data-testid="e2eInlineEditTruncationWithMenu">
                <kbq-dropdown #dropdown="kbqDropdown">
                    <button kbq-dropdown-item>Action</button>
                </kbq-dropdown>
                <i
                    kbqInlineEditMenu
                    kbq-icon-button="kbq-ellipsis-vertical_16"
                    [kbqDropdownTriggerFor]="dropdown"
                    [color]="'contrast-fade'"
                ></i>
                <div class="truncated-text" kbqInlineEditViewMode>Long text value that should be truncated</div>
                <kbq-form-field kbqInlineEditEditMode>
                    <input kbqInput [value]="'Long text value that should be truncated'" />
                </kbq-form-field>
            </kbq-inline-edit>

            <kbq-inline-edit disabled>
                <div class="truncated-text" kbqInlineEditViewMode>Long text value that should be truncated</div>
                <kbq-form-field kbqInlineEditEditMode>
                    <input kbqInput [value]="'Long text value that should be truncated'" />
                </kbq-form-field>
            </kbq-inline-edit>
        </div>
    `,
    styles: `
        :host {
            max-width: 200px;
        }

        .truncated-text {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-top-l layout-row',
        'data-testid': 'e2eInlineEditTruncation'
    }
})
export class E2eInlineEditTruncation {}

@Component({
    selector: 'e2e-inline-edit-menu-button',
    imports: [
        FormsModule,
        KbqInlineEditModule,
        KbqInputModule,
        KbqButtonModule,
        KbqDropdownModule,
        KbqIconModule
    ],
    template: `
        <div class="layout-column flex" data-testid="e2eInlineEditMenuButtonContainer">
            <kbq-inline-edit>
                <kbq-dropdown #dropdown="kbqDropdown">
                    <button kbq-dropdown-item>Action 1</button>
                    <button kbq-dropdown-item>Action 2</button>
                </kbq-dropdown>
                <i
                    kbqInlineEditMenu
                    kbq-icon-button="kbq-ellipsis-vertical_16"
                    [kbqDropdownTriggerFor]="dropdown"
                    [color]="'contrast-fade'"
                ></i>
                <div class="example-inline-text" kbqInlineEditViewMode>value</div>
                <kbq-form-field kbqInlineEditEditMode>
                    <input kbqInput [value]="'value'" />
                </kbq-form-field>
            </kbq-inline-edit>
        </div>
    `,
    styles: `
        :host {
            max-width: 200px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-top-l layout-row',
        'data-testid': 'e2eInlineEditMenuButton'
    }
})
export class E2eInlineEditMenuButton {}

@Component({
    selector: 'e2e-inline-edit-action-buttons',
    imports: [
        ReactiveFormsModule,
        KbqInlineEditModule,
        KbqTextareaModule,
        KbqButtonModule
    ],
    template: `
        <button kbq-button data-testid="e2eInlineEditActionButtonsOpen" (click)="textareaInlineEdit.toggleMode()">
            open
        </button>

        <div data-testid="e2eInlineEditActionButtonsContainer" style="height: 120px">
            <kbq-inline-edit #textareaInlineEdit showActions>
                <div kbqInlineEditViewMode>{{ control.value || 'empty' }}</div>

                <div kbqInlineEditEditMode>
                    @if (textareaInlineEdit.modeAsReadonly() === 'edit') {
                        <kbq-form-field>
                            <textarea kbqTextarea [formControl]="control"></textarea>
                        </kbq-form-field>
                    }
                </div>
            </kbq-inline-edit>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-top-l layout-column layout-gap-m',
        style: 'max-width: 400px',
        'data-testid': 'e2eInlineEditActionButtons'
    }
})
export class E2eInlineEditActionButtons {
    readonly control = new FormControl('Initial value', Validators.required);
}

const E2E_COMMENTS: string[] = [
    'Issue resolved after restarting the affected service. No further action required.',
    'Root cause identified as a misconfigured environment variable, fixed and redeployed.',
    'Duplicate of an existing issue, closing without further changes.',
    'Waiting on additional information from the reporter before further diagnosis.'
];

@Component({
    selector: 'e2e-inline-edit-select-multiline',
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
            <kbq-inline-edit data-testid="e2eInlineEditSelectMultiline">
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
                        [panelClass]="'e2e-inline-edit-select-multiline__options'"
                        [placeholder]="notSetLabel"
                        [formControl]="control"
                    >
                        <kbq-option [value]="null">{{ notSetLabel }}</kbq-option>
                        @for (comment of comments; track comment) {
                            <kbq-option [value]="comment">{{ comment }}</kbq-option>
                        }
                    </kbq-select>
                </kbq-form-field>
            </kbq-inline-edit>
        </div>
    `,
    styles: `
        :host {
            display: block;
            width: 350px;
            height: 400px;
            padding: 8px;
        }

        ::ng-deep .e2e-inline-edit-select-multiline__options .kbq-option-text {
            white-space: normal;
            overflow-wrap: break-word;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-margin-top-l',
        'data-testid': 'e2eInlineEditSelectMultilineContainer'
    }
})
export class E2eInlineEditSelectMultiline {
    protected readonly notSetLabel = 'Not specified';
    protected readonly comments = E2E_COMMENTS;
    protected readonly control = new FormControl<string | null>(E2E_COMMENTS[0]);
}
