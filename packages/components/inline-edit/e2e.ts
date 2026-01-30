import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, viewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { kbqInjectNativeElement } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqInlineEdit } from './inline-edit';
import { KbqInlineEditModule } from './module';

@Component({
    selector: 'e2e-inline-edit-states',
    imports: [
        KbqInlineEditModule,
        FormsModule,
        KbqFormFieldModule,
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
            .querySelectorAll<HTMLElement>('.kbq-inline-edit__focus_container')
            .forEach((focusContainer) => {
                focusContainer.classList.add('cdk-focused');
                focusContainer.classList.add('cdk-keyboard-focused');
            });
    }
}
