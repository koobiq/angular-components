import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqTagsModule } from '@koobiq/components/tags';
import { injectExampleText } from './l10n';

/**
 * @title select-custom-tag-content
 */
@Component({
    selector: 'select-custom-tag-content-example',
    imports: [KbqSelectModule, KbqTagsModule, KbqIconModule],
    template: `
        <kbq-form-field>
            <kbq-select multiple [placeholder]="text().placeholder" [(value)]="selected">
                @for (name of severityNames(); track name) {
                    <kbq-option [value]="name">{{ name }}</kbq-option>
                }

                <ng-template #kbqSelectTagContent let-option let-select="select">
                    <kbq-tag
                        [selectable]="false"
                        [disabled]="option.disabled || select.disabled()"
                        [color]="severities()[option.value].color"
                    >
                        <i kbqTagPrefix [kbq-icon]="severities()[option.value].icon"></i>
                        {{ option.viewValue }}
                        <!-- The custom template replaces the built-in markup, so the remove control is up to us. -->
                        @if (!option.disabled && !select.disabled()) {
                            <i
                                kbq-icon="kbq-xmark-s_16"
                                kbqTagRemove
                                (click)="select.onRemoveMatcherItem(option, $event)"
                            ></i>
                        }
                    </kbq-tag>
                </ng-template>

                <kbq-cleaner #kbqSelectCleaner />
            </kbq-select>
        </kbq-form-field>
    `,
    styles: `
        :host {
            display: flex;
            justify-content: center;
            padding: var(--kbq-size-l);
        }

        .kbq-form-field {
            width: 320px;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectCustomTagContentExample {
    protected readonly text = injectExampleText();

    /**
     * Per-value tag appearance — the built-in markup paints every tag with the same color.
     * Only these four colors are themed for `kbq-tag`.
     */
    readonly severities = computed<Record<string, { color: KbqComponentColors; icon: string }>>(() => ({
        [this.text().severities[0]]: { color: KbqComponentColors.Error, icon: 'kbq-circle-xmark_16' },
        [this.text().severities[1]]: { color: KbqComponentColors.Warning, icon: 'kbq-triangle-exclamation_16' },
        [this.text().severities[2]]: { color: KbqComponentColors.Theme, icon: 'kbq-circle-info_16' },
        [this.text().severities[3]]: { color: KbqComponentColors.ContrastFade, icon: 'kbq-circle-info_16' }
    }));

    /** List of options — the keys of `severities`, computed once so the template doesn't rebuild it. */
    readonly severityNames = computed(() => Object.keys(this.severities()));

    /** Selected values; not readonly, because the field is bound with `[(value)]`. */
    selected = this.severityNames().slice(0, 3);
}
