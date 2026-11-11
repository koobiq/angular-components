import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqTitleModule } from '@koobiq/components/title';
import { injectExampleText } from './l10n';

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
export class TitleOverviewExample {
    protected readonly text = injectExampleText();

    defaultValue = this.text().justText;
    longValue = `${this.defaultValue}` + this.text().andLongText.repeat(6);
    field = this.defaultValue;

    onAddText() {
        this.field = `${this.field}` + this.text().andLongText.repeat(3);
    }
}
