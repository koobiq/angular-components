import { CdkMonitorFocus } from '@angular/cdk/a11y';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import { NgClass } from '@angular/common';
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
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSelect, KbqSelectPanelWidth } from '@koobiq/components/select';

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
        KbqIconModule,
        NgClass
    ],
    templateUrl: 'timezone-select.component.html',
    styleUrls: ['../select/select.scss', 'timezone-select.component.scss', 'timezone-option-tokens.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'kbqTimezoneSelect',
    providers: [
        { provide: KbqFormFieldControl, useExisting: KbqTimezoneSelect },
        { provide: KBQ_OPTION_PARENT_COMPONENT, useExisting: KbqTimezoneSelect }
    ]
})
export class KbqTimezoneSelect extends KbqSelect implements AfterContentInit {
    @ContentChild(KbqTimezoneSelectTrigger, { static: false }) customTrigger: KbqTimezoneSelectTrigger;

    override panelWidth: KbqSelectPanelWidth = this.defaultOptions?.panelWidth || 'auto';
    override panelMinWidth: number = 640;

    ngAfterContentInit() {
        super.ngAfterContentInit();

        this.localeService?.changes
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(this.updateLocaleParamsForSearch);

        this.updateLocaleParamsForSearch();
    }

    private updateLocaleParamsForSearch = () => {
        const placeholder = this.localeService?.getParams('timezone').searchPlaceholder || defaultSearchPlaceholder;

        if (this.search && !this.search.hasPlaceholder()) {
            this.search.setPlaceholder(placeholder);
        }
    };
}
