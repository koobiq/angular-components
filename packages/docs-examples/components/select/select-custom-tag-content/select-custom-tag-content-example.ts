import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqTagsModule } from '@koobiq/components/tags';

/**
 * @title select-custom-tag-content
 */
@Component({
    selector: 'select-custom-tag-content-example',
    imports: [KbqSelectModule, KbqTagsModule, KbqIconModule],
    template: `
        <kbq-form-field>
            <kbq-select multiple placeholder="Placeholder" [(value)]="selected">
                @for (name of severityNames; track name) {
                    <kbq-option [value]="name">{{ name }}</kbq-option>
                }

                <ng-template #kbqSelectTagContent let-option let-select="select">
                    <kbq-tag
                        [selectable]="false"
                        [disabled]="option.disabled || select.disabled"
                        [color]="severities[option.value].color"
                    >
                        <i [kbq-icon]="severities[option.value].icon"></i>
                        {{ option.viewValue }}
                        <!-- The custom template replaces the built-in markup, so the remove control is up to us. -->
                        @if (!option.disabled && !select.disabled) {
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
    /**
     * Per-value tag appearance — the built-in markup paints every tag with the same color.
     * Only these four colors are themed for `kbq-tag`.
     */
    readonly severities: Record<string, { color: KbqComponentColors; icon: string }> = {
        Critical: { color: KbqComponentColors.Error, icon: 'kbq-circle-xmark_16' },
        Major: { color: KbqComponentColors.Warning, icon: 'kbq-triangle-exclamation_16' },
        Minor: { color: KbqComponentColors.Theme, icon: 'kbq-circle-info_16' },
        Info: { color: KbqComponentColors.ContrastFade, icon: 'kbq-circle-info_16' }
    };

    /** List of options — the keys of `severities`, computed once so the template doesn't rebuild it. */
    readonly severityNames = Object.keys(this.severities);

    /** Selected values; not readonly, because the field is bound with `[(value)]`. */
    selected = this.severityNames.slice(0, 3);
}
