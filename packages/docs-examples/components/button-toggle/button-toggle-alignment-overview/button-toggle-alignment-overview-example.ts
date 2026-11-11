import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqIconModule } from '@koobiq/components/icon';
import { injectExampleText } from '../l10n';

/**
 * @title Button toggle alignment
 */
@Component({
    selector: 'button-toggle-alignment-overview-example',
    imports: [
        KbqButtonToggleModule,
        FormsModule,
        KbqIconModule
    ],
    templateUrl: 'button-toggle-alignment-overview-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonToggleAlignmentOverviewExample {
    protected readonly text = injectExampleText();

    readonly group = computed(() => [this.text().courier, this.text().donkeyExpress, this.text().middleEarthPost]);

    model = 0;
}
