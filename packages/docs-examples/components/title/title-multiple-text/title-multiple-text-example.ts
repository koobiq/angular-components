import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { KbqTitleModule } from '@koobiq/components/title';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Multiple text elements
 */
@Component({
    selector: 'title-multiple-text-example',
    imports: [KbqTitleModule],
    template: `
        <div class="example-title-multiple-text" kbq-title>
            <div #kbqTitleContainer class="example-title-multiple-text__row">
                <span #kbqTitleText class="example-title-multiple-text__name kbq-text-normal">{{ name() }}:</span>
                <span #kbqTitleText class="example-title-multiple-text__value kbq-text-normal">{{ value() }}</span>
            </div>
        </div>
    `,
    styleUrls: ['./title-multiple-text-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleMultipleTextExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    readonly name = computed(() => this.t().status);
    readonly value = computed(() => this.t().longValueMultiple);
}
