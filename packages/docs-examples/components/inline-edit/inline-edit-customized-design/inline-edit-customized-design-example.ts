import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { kbqDisableLegacyValidationDirectiveProvider, KbqOptionModule, PopUpPlacements } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInlineEditModule } from '@koobiq/components/inline-edit';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqTagEvent, KbqTagsModule } from '@koobiq/components/tags';
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
        KbqTagsModule
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
                Tags
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
                    <kbq-tag-list removable>
                        @for (option of options(); track option) {
                            <kbq-tag
                                [value]="option"
                                [selected]="badgeControl.value === option"
                                (removed)="removed($event)"
                            >
                                {{ option }}
                                <i kbq-icon-button="kbq-xmark-s_16" kbqTagRemove></i>
                            </kbq-tag>
                        }
                    </kbq-tag-list>
                }
            </div>
            <kbq-form-field kbqInlineEditEditMode>
                <kbq-select [placeholder]="placeholder" [formControl]="badgeControl">
                    @for (option of options(); track option) {
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
    protected readonly options = signal(['Critical', 'High', 'Medium', 'Low']);

    protected readonly linkControl = new FormControl('https://github.com/koobiq/icons');
    protected readonly badgeControl = new FormControl(this.options()[0]);
    protected readonly iconControl = new FormControl('Value');
    protected readonly popupPlacements = PopUpPlacements;

    protected removed(event: KbqTagEvent): void {
        this.options.update((tags) => {
            const index = tags.indexOf(event.tag.value);

            tags.splice(index, 1);

            console.log(`Tag #${index} was removed:`, event);

            if (event.tag.value === this.badgeControl.value) {
                if (!tags.length) {
                    this.badgeControl.setValue(null);
                } else {
                    this.badgeControl.setValue(tags[index]);
                }
            }

            return tags;
        });
    }
}
