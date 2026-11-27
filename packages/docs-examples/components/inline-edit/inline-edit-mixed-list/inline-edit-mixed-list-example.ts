import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { KbqDd, KbqDl, KbqDt } from '@koobiq/components/dl';
import { KbqInlineEditModule } from '@koobiq/components/inline-edit';
import { KbqInputModule } from '@koobiq/components/input';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Inline edit mixed list
 */
@Component({
    selector: 'inline-edit-mixed-list-example',
    imports: [
        NgTemplateOutlet,
        ReactiveFormsModule,
        KbqInlineEditModule,
        KbqDl,
        KbqDt,
        KbqDd,
        KbqInputModule
    ],
    template: `
        <form [formGroup]="form">
            <kbq-dl wide [vertical]="false">
                <kbq-dt>{{ t().country }}</kbq-dt>
                <kbq-dd>
                    <kbq-inline-edit>
                        <div class="example-inline-text" kbqInlineEditViewMode>
                            <ng-container *ngTemplateOutlet="view; context: { $implicit: form.controls.country }" />
                        </div>
                        <kbq-form-field kbqInlineEditEditMode>
                            <input kbqInput [placeholder]="t().placeholder" [formControl]="form.controls.country" />
                        </kbq-form-field>
                    </kbq-inline-edit>
                </kbq-dd>

                <kbq-dt>{{ t().capital }}</kbq-dt>
                <kbq-dd>
                    <kbq-inline-edit>
                        <div class="example-inline-text" kbqInlineEditViewMode>
                            <ng-container *ngTemplateOutlet="view; context: { $implicit: form.controls.capital }" />
                        </div>
                        <kbq-form-field kbqInlineEditEditMode>
                            <input kbqInput [placeholder]="t().placeholder" [formControl]="form.controls.capital" />
                        </kbq-form-field>
                    </kbq-inline-edit>
                </kbq-dd>
            </kbq-dl>

            <kbq-inline-edit class="example-mixed-list__vertical">
                <kbq-label>{{ t().currency }}</kbq-label>

                <div class="example-inline-text" kbqInlineEditViewMode>
                    <ng-container *ngTemplateOutlet="view; context: { $implicit: form.controls.currency }" />
                </div>
                <kbq-form-field kbqInlineEditEditMode>
                    <input kbqInput [placeholder]="t().placeholder" [formControl]="form.controls.currency" />
                </kbq-form-field>
            </kbq-inline-edit>
        </form>

        <ng-template #view let-control>
            @if (!control.value) {
                <span kbqInlineEditPlaceholder>{{ t().placeholder }}</span>
            } @else {
                {{ control.value }}
            }
        </ng-template>
    `,
    styles: `
        form {
            --example-term-width: 160px;
            --example-term-gap: var(--kbq-size-xl);

            display: flex;
            flex-direction: column;
            gap: var(--kbq-size-s);
            width: 100%;
        }

        :host .kbq-dl {
            grid-template-columns: var(--example-term-width) minmax(0, 1fr);
            column-gap: var(--example-term-gap);
            --kbq-description-list-size-horizontal-gap-vertical: 0;
        }

        .kbq-dt {
            display: inline-flex;
            align-items: center;
        }

        .example-mixed-list__vertical {
            margin-left: calc(var(--example-term-width) + var(--example-term-gap));
        }

        .example-inline-text {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InlineEditMixedListExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
    protected readonly form = new FormGroup({
        country: new FormControl('Spain'),
        capital: new FormControl('Madrid'),
        currency: new FormControl('Euro')
    });
}
