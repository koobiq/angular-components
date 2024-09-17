import { ChangeDetectionStrategy, Component, ContentChild, Directive, ViewEncapsulation } from '@angular/core';
import { KBQ_OPTION_PARENT_COMPONENT, KbqSelectSearch } from '@koobiq/components/core';
import { KbqCleaner, KbqFormFieldControl } from '@koobiq/components/form-field';
import { KbqSelect } from '@koobiq/components/select';

@Directive({ selector: 'kbq-timezone-select-trigger' })
export class KbqTimezoneSelectTrigger {}

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
export class KbqTimezoneSelect extends KbqSelect {
    @ContentChild(KbqTimezoneSelectTrigger, { static: false }) customTrigger: KbqTimezoneSelectTrigger;

    @ContentChild('kbqSelectCleaner', { static: true }) cleaner: KbqCleaner;

    @ContentChild(KbqSelectSearch, { static: false }) search: KbqSelectSearch;
}
