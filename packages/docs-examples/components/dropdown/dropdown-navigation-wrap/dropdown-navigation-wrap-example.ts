import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqOptionModule } from '@koobiq/components/core';
import { KbqDividerModule } from '@koobiq/components/divider';
import { KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title Dropdown navigation wrap
 */
@Component({
    selector: 'dropdown-navigation-wrap-example',
    imports: [
        KbqDropdownModule,
        KbqButtonModule,
        KbqIconModule,
        KbqDividerModule,
        KbqOptionModule
    ],
    templateUrl: 'dropdown-navigation-wrap-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownNavigationWrapExample {
    protected readonly t = injectTranslation(TRANSLATIONS);
}
