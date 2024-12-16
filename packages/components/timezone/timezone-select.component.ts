import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    ContentChild,
    Directive,
    ViewEncapsulation
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KBQ_OPTION_PARENT_COMPONENT, ruRULocaleData } from '@koobiq/components/core';
import { KbqFormFieldControl } from '@koobiq/components/form-field';
import { KbqSelect, KbqSelectPanelWidth } from '@koobiq/components/select';

@Directive({ selector: 'kbq-timezone-select-trigger' })
export class KbqTimezoneSelectTrigger {}

const defaultSearchPlaceholder = ruRULocaleData.timezone.searchPlaceholder;

@Component({
    selector: 'kbq-timezone-select',
    exportAs: 'kbqTimezoneSelect',
    templateUrl: 'timezone-select.component.html',
    styleUrls: ['../select/select.scss', 'timezone-select.component.scss', 'timezone-option-tokens.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: KbqFormFieldControl, useExisting: KbqTimezoneSelect },
        { provide: KBQ_OPTION_PARENT_COMPONENT, useExisting: KbqTimezoneSelect }
    ]
})
export class KbqTimezoneSelect extends KbqSelect implements AfterContentInit {
    @ContentChild(KbqTimezoneSelectTrigger, { static: false }) customTrigger: KbqTimezoneSelectTrigger;

    override panelWidth: KbqSelectPanelWidth = 'auto';

    ngAfterContentInit() {
        super.ngAfterContentInit();

        this.localeService?.changes.pipe(takeUntilDestroyed()).subscribe(this.updateLocaleParamsForSearch);

        this.updateLocaleParamsForSearch();
    }

    private updateLocaleParamsForSearch = () => {
        const placeholder = this.localeService?.getParams('timezone').searchPlaceholder || defaultSearchPlaceholder;

        if (this.search && !this.search.hasPlaceholder()) {
            this.search.setPlaceholder(placeholder);
        }
    };
}
