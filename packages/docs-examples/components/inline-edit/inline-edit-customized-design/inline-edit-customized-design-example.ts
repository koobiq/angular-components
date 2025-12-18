import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { kbqDisableLegacyValidationDirectiveProvider, KbqOptionModule, PopUpPlacements } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInlineEditModule } from '@koobiq/components/inline-edit';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqToolTipModule } from '@koobiq/components/tooltip';

/**
 * @title Inline edit customized design
 */
@Component({
    selector: 'inline-edit-customized-design-example',
    imports: [
        ReactiveFormsModule,
        KbqInlineEditModule,
        KbqFormFieldModule,
        KbqInputModule,
        KbqToolTipModule,
        KbqOptionModule,
        KbqSelectModule,
        KbqIconModule,
        KbqLinkModule,
        KbqBadgeModule
    ],
    template: `
        <kbq-inline-edit>
            <kbq-label>Link</kbq-label>

            <div class="example-inline-text example-inline-text_link" kbqInlineEditViewMode>
                @if (!linkControl.value) {
                    <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                } @else {
                    <a kbq-link [href]="linkControl.value">{{ linkControl.value }}</a>
                }
            </div>
            <kbq-form-field kbqInlineEditEditMode>
                <input kbqInput [placeholder]="placeholder" [formControl]="linkControl" />
            </kbq-form-field>
        </kbq-inline-edit>

        <kbq-inline-edit>
            <kbq-label class="example-inline-text__content">
                Badge
                <i
                    kbq-icon-button="kbq-circle-question_16"
                    [kbqTooltip]="'Tooltip on hover or focus'"
                    [kbqTooltipArrow]="false"
                    [kbqPlacement]="popupPlacements.Top"
                    [color]="'contrast-fade'"
                ></i>
            </kbq-label>

            <div class="example-inline-text" kbqInlineEditViewMode>
                @if (!badgeControl.value) {
                    <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                } @else {
                    <kbq-badge [badgeColor]="'fade-success'">{{ badgeControl.value }}</kbq-badge>
                }
            </div>
            <kbq-form-field kbqInlineEditEditMode>
                <kbq-select [placeholder]="placeholder" [formControl]="badgeControl">
                    @for (option of options; track option) {
                        <kbq-option [value]="option">{{ option }}</kbq-option>
                    }
                </kbq-select>
            </kbq-form-field>
        </kbq-inline-edit>

        <kbq-inline-edit>
            <kbq-label>Icon + Text</kbq-label>

            <div class="example-inline-text" kbqInlineEditViewMode>
                @if (!iconControl.value) {
                    <span kbqInlineEditPlaceholder>{{ placeholder }}</span>
                } @else {
                    <span class="example-inline-text__content">
                        <i kbq-icon="kbq-diamond_16" [color]="'contrast-fade'"></i>
                        {{ iconControl.value }}
                    </span>
                }
            </div>
            <kbq-form-field kbqInlineEditEditMode>
                <input kbqInput [placeholder]="placeholder" [formControl]="iconControl" />
            </kbq-form-field>
        </kbq-inline-edit>
    `,
    styles: `
        .example-inline-text {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .example-inline-text_link {
            padding: 1px;
        }

        .example-inline-text__content {
            display: inline-flex;
            align-items: center;
            gap: var(--kbq-size-xs);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-flex layout-column'
    },
    providers: [
        kbqDisableLegacyValidationDirectiveProvider()
    ]
})
export class InlineEditCustomizedDesignExample {
    protected readonly placeholder = 'Placeholder';
    protected readonly options = ['Critical', 'High', 'Medium', 'Low'];

    protected readonly linkControl = new FormControl('https://github.com/koobiq/icons');
    protected readonly badgeControl = new FormControl(this.options[0]);
    protected readonly iconControl = new FormControl('Value');
    protected readonly popupPlacements = PopUpPlacements;
}
