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
import { KbqScrollbarViewport } from '@koobiq/components/scrollbar';
import { KbqSelect, KbqSelectHiddenItemsMeasurer } from '@koobiq/components/select';

@Directive({
    selector: 'kbq-timezone-select-trigger'
})
export class KbqTimezoneSelectTrigger {}

/**
 * Returns an exception to be thrown when `multiple` is turned on for a timezone select, which renders one
 * value in its trigger and has no multi-selection template behind it.
 *
 * @docs-private
 */
export function getKbqTimezoneSelectMultipleError(): Error {
    return Error('`kbq-timezone-select` does not support multiple selection.');
}

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
        KbqIconModule,
        KbqScrollbarViewport
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
        kbqSiblingPopupProvider(KbqTimezoneSelect),
        // Same reason: the field that injects it is declared on `KbqSelect`, but the injector consulted is
        // this component's own. The measurer cannot move to the root injector — it needs `Renderer2`.
        KbqSelectHiddenItemsMeasurer
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    exportAs: 'kbqTimezoneSelect'
})
export class KbqTimezoneSelect extends KbqSelect {
    readonly customTrigger = contentChild(KbqTimezoneSelectTrigger);

    /**
     * Not supported: the trigger renders a single value and the panel has no tag list or pseudo-checkboxes
     * behind it, so a truthy value is rejected instead of half-rendered.
     */
    override get multiple(): boolean {
        return super.multiple;
    }

    override set multiple(value: boolean) {
        if (value) {
            throw getKbqTimezoneSelectMultipleError();
        }

        super.multiple = value;
    }

    /** Strings currently rendered by the select. */
    get configuration(): KbqTimezoneLocaleConfiguration {
        return this._configuration();
    }

    private readonly _configuration = kbqInjectLocaleConfiguration('timezone', KBQ_TIMEZONE_CONFIGURATION);

    /**
     * Whether the placeholder the search carries is the one this component wrote. `setPlaceholder` writes
     * straight into the input and `hasPlaceholder()` reads it back, so the guard has to remember the write
     * instead of probing the DOM — otherwise the effect's own string makes it skip every later locale.
     */
    private appliedLocalePlaceholder = false;

    constructor() {
        super();

        // The projected search takes its placeholder as a plain property rather than through a template
        // binding, so the string has to be pushed into it. An effect applies it as soon as the query
        // resolves, without waiting for a lifecycle hook of this component.
        effect(() => {
            const placeholder = this._configuration().searchPlaceholder;
            const search = this.search();

            if (!search) return;

            // A placeholder supplied by the consumer wins and is never overwritten; one this effect wrote
            // is replaced, so the field follows the active locale.
            if (search.hasPlaceholder() && !this.appliedLocalePlaceholder) return;

            search.setPlaceholder(placeholder);
            this.appliedLocalePlaceholder = true;
        });
    }
}
