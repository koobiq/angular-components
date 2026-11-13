import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqIconModule } from '@koobiq/components/icon';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

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
    protected readonly t = injectTranslation(TRANSLATIONS);

    readonly group = computed(() => [this.t().courier, this.t().donkeyExpress, this.t().middleEarthPost]);

    model = 0;
}
