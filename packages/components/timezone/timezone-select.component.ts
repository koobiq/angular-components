import { CdkMonitorFocus } from '@angular/cdk/a11y';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import {
    AfterContentInit,
    ChangeDetectionStrategy,
    Component,
    Directive,
    ViewEncapsulation,
    contentChild
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KBQ_OPTION_PARENT_COMPONENT, ruRULocaleData } from '@koobiq/components/core';
import { KbqFormFieldControl } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSelect } from '@koobiq/components/select';

@Directive({
    selector: 'kbq-timezone-select-trigger'
})
export class KbqTimezoneSelectTrigger {}

const defaultSearchPlaceholder = ruRULocaleData.timezone.searchPlaceholder;

@Component({
    selector: 'kbq-timezone-select',
    imports: [
        CdkOverlayOrigin,
        CdkConnectedOverlay,
        CdkMonitorFocus,
        KbqIconModule
    ],
    templateUrl: 'timezone-select.component.html',
    styleUrls: [
        '../select/select.scss',
        '../select/select-tokens.scss',
        'timezone-select.component.scss',
        'timezone-option-tokens.scss'
    ],
    providers: [
        { provide: KbqFormFieldControl, useExisting: KbqTimezoneSelect },
        { provide: KBQ_OPTION_PARENT_COMPONENT, useExisting: KbqTimezoneSelect }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    exportAs: 'kbqTimezoneSelect'
})
export class KbqTimezoneSelect extends KbqSelect implements AfterContentInit {
    readonly customTrigger = contentChild(KbqTimezoneSelectTrigger);

    ngAfterContentInit() {
        super.ngAfterContentInit();

        this.localeService?.changes
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(this.updateLocaleParamsForSearch);

        this.updateLocaleParamsForSearch();
    }

    private updateLocaleParamsForSearch = () => {
        const placeholder = this.localeService?.getParams('timezone').searchPlaceholder || defaultSearchPlaceholder;

        const search = this.search();

        if (search && !search.hasPlaceholder()) {
            search.setPlaceholder(placeholder);
        }
    };
}
