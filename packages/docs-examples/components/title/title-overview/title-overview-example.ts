import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqTitleModule } from '@koobiq/components/title';

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
    defaultValue = 'Just a text';
    longValue = `${this.defaultValue} and a long text and a long text and a long text and a long text and a long text and a long text`;
    field = this.defaultValue;

    onAddText() {
        this.field = `${this.field} and a long text and a long text and a long text`;
    }
}
