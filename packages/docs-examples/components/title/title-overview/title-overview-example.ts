import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqTitleModule } from '@koobiq/components/title';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleTranslation, TRANSLATIONS } from './l10n';

/**
 * @title Title
 */
@Component({
    selector: 'title-overview-example',
    imports: [
        KbqTitleModule,
        KbqButtonModule
    ],
    template: `
        <div class="example-title-overview-container example-title-overview-container-responsive">
            <div class="example-title-overview-child wide kbq-text-big" kbq-title>
                {{ longValue }}
            </div>
        </div>
    `,
    styleUrls: ['./title-overview-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleOverviewExample extends BaseLocalizedExample<ExampleTranslation> {
    defaultValue = this.t().justText;
    longValue = `${this.defaultValue}` + this.t().andLongText.repeat(6);
    field = this.defaultValue;

    onAddText() {
        this.field = `${this.field}` + this.t().andLongText.repeat(3);
    }

    constructor() {
        super(TRANSLATIONS);
    }
}
