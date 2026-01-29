import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqInlineEditModule } from './module';

@Component({
    selector: 'e2e-inline-edit-states',
    imports: [
        KbqInlineEditModule,
        FormsModule,
        KbqFormFieldModule,
        KbqInputModule,
        NgTemplateOutlet
    ],
    template: `
        <div class="layout-column layout-gap-xxl">
            <kbq-inline-edit class="e2e-inline-edit-empty">
                <div class="example-inline-text" kbqInlineEditViewMode>
                    <ng-container *ngTemplateOutlet="view; context: { $implicit: { value: '' } }" />
                </div>
                <kbq-form-field kbqInlineEditEditMode>
                    <input kbqInput [placeholder]="'placeholder'" />
                </kbq-form-field>
            </kbq-inline-edit>

            <kbq-inline-edit class="e2e-inline-edit-filled">
                <div class="example-inline-text" kbqInlineEditViewMode>
                    <ng-container *ngTemplateOutlet="view; context: { $implicit: { value: 'value' } }" />
                </div>
                <kbq-form-field kbqInlineEditEditMode>
                    <input kbqInput [placeholder]="'placeholder'" [value]="'value'" />
                </kbq-form-field>
            </kbq-inline-edit>

            <kbq-inline-edit class="e2e-inline-edit-with-label">
                <kbq-label>Label</kbq-label>

                <div class="example-inline-text" kbqInlineEditViewMode>
                    <ng-container *ngTemplateOutlet="view; context: { $implicit: { value: 'value' } }" />
                </div>
                <kbq-form-field kbqInlineEditEditMode>
                    <input kbqInput [placeholder]="'placeholder'" [value]="'value'" />
                </kbq-form-field>
            </kbq-inline-edit>

            <kbq-inline-edit showActions data-testid="e2eInlineEditWithActions">
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
        class: 'layout-margin-top-l layout-margin-bottom-l layout-column',
        'data-testid': 'e2eInlineEditStates'
    }
})
export class E2eInlineEditStates {}
