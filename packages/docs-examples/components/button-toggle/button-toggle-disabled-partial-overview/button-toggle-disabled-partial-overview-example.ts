import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqIconModule } from '@koobiq/components/icon';
import { injectExampleText } from '../l10n';

/**
 * @title Button toggle disabled partial
 */
@Component({
    selector: 'button-toggle-disabled-partial-overview-example',
    imports: [
        KbqButtonToggleModule,
        KbqIconModule
    ],
    templateUrl: 'button-toggle-disabled-partial-overview-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonToggleDisabledPartialOverviewExample {
    protected readonly text = injectExampleText();
}
