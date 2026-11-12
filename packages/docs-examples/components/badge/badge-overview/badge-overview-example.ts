import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqBadgeColors, KbqBadgeModule } from '@koobiq/components/badge';
import { BaseLocalizedExample } from '@koobiq/docs-examples/i18n';
import { ExampleText, TEXT } from './l10n';

/**
 * @title Badge fill and style
 */
@Component({
    selector: 'badge-overview-example',
    imports: [
        KbqBadgeModule
    ],
    templateUrl: 'badge-overview-example.html',
    styleUrls: ['badge-overview-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BadgeOverviewExample extends BaseLocalizedExample<ExampleText> {
    colors = KbqBadgeColors;

    constructor() {
        super(TEXT);
    }
}
