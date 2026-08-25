import { CdkMonitorFocus } from '@angular/cdk/a11y';
import { CdkConnectedOverlay, CdkOverlayOrigin } from '@angular/cdk/overlay';
import {
    ChangeDetectionStrategy,
    Component,
    contentChild,
    Directive,
    effect,
    inject,
    InjectionToken,
    Provider,
    ViewEncapsulation
} from '@angular/core';
import {
    KBQ_OPTION_PARENT_COMPONENT,
    KbqDeepPartial,
    kbqInjectLocaleConfiguration,
    kbqLocaleConfigurationOverrideProvider,
    kbqSiblingPopupProvider,
    KbqTimezoneLocaleConfiguration,
    ruRULocaleData
} from '@koobiq/components/core';
import { kbqCleanerFactoryProvider, KbqFormFieldControl } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSelect } from '@koobiq/components/select';

@Directive({
    selector: 'kbq-timezone-select-trigger'
})
export class KbqTimezoneSelectTrigger {}

/** default configuration of timezone
 * @docs-private */
export const KBQ_TIMEZONE_DEFAULT_CONFIGURATION: KbqTimezoneLocaleConfiguration = ruRULocaleData.timezone;

/** Injection Token for providing the default configuration of timezone
 * @docs-private */
export const KBQ_TIMEZONE_CONFIGURATION = new InjectionToken<KbqTimezoneLocaleConfiguration>(
    'KbqTimezoneConfiguration',
    { factory: () => KBQ_TIMEZONE_DEFAULT_CONFIGURATION }
);

/**
 * Utility provider for `KBQ_TIMEZONE_CONFIGURATION`. Only the strings you pass are overridden; the rest keep
 * following the active locale.
 */
export const kbqTimezoneLocaleConfigurationProvider = (
    configuration: KbqDeepPartial<KbqTimezoneLocaleConfiguration>
): Provider => kbqLocaleConfigurationOverrideProvider('timezone', configuration);

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
        kbqCleanerFactoryProvider(() => {
            const timezoneSelect = inject(KbqTimezoneSelect);

            return {
                get control() {
                    return timezoneSelect;
                },
                get keydownTarget() {
                    return timezoneSelect.elementRef.nativeElement;
                },
                clearByEscape: false,
                clear: () => timezoneSelect.clear()
            };
        }),
        { provide: KBQ_OPTION_PARENT_COMPONENT, useExisting: KbqTimezoneSelect },
        // Declared again rather than inherited from `KbqSelect`: Angular copies `providers` to a subclass only
        // when that subclass has no decorator of its own.
        kbqSiblingPopupProvider(KbqTimezoneSelect)
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    exportAs: 'kbqTimezoneSelect'
})
export class KbqTimezoneSelect extends KbqSelect {
    readonly customTrigger = contentChild(KbqTimezoneSelectTrigger);

    /** Strings currently rendered by the select. */
    get configuration(): KbqTimezoneLocaleConfiguration {
        return this._configuration();
    }

    private readonly _configuration = kbqInjectLocaleConfiguration('timezone', KBQ_TIMEZONE_CONFIGURATION);

    constructor() {
        super();

        // The projected search takes its placeholder as a plain property rather than through a template
        // binding, so the string has to be pushed into it. An effect applies it as soon as the query
        // resolves, without waiting for a lifecycle hook of this component.
        effect(() => {
            const placeholder = this._configuration().searchPlaceholder;
            const search = this.search();

            // A placeholder supplied by the consumer wins and is never overwritten - which also means the
            // locale one is applied only once, exactly as the previous subscription did.
            if (search && !search.hasPlaceholder()) {
                search.setPlaceholder(placeholder);
            }
        });
    }
}
