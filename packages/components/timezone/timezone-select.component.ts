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
    kbqLocaleConfigurationOverrideProvider,
    KbqLocaleOverridesDirective,
    KbqSelectSearch,
    kbqSiblingPopupProvider,
    KbqTimezoneLocaleConfiguration,
    ruRULocaleData
} from '@koobiq/components/core';
import { kbqCleanerFactoryProvider, KbqFormField, KbqFormFieldControl } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqScrollbarViewport } from '@koobiq/components/scrollbar';
import { KbqSelect, KbqSelectHiddenItemsMeasurer } from '@koobiq/components/select';

@Directive({
    selector: 'kbq-timezone-select-trigger'
})
export class KbqTimezoneSelectTrigger {}

/**
 * Returns an exception to be thrown when `multiple` or `multiline` is turned on for a timezone select, which renders one
 * value in its trigger and has no multi-selection template behind it.
 *
 * @docs-private
 */
export function getKbqTimezoneSelectMultipleError(): Error {
    return Error('`kbq-timezone-select` does not support multiple selection.');
}

/**
 * default configuration of timezone
 *
 * @docs-private
 */
export const KBQ_TIMEZONE_DEFAULT_LOCALE_CONFIGURATION: KbqTimezoneLocaleConfiguration = ruRULocaleData.timezone;

/**
 * Injection Token for providing the default configuration of timezone
 *
 * @docs-private
 */
export const KBQ_TIMEZONE_LOCALE_CONFIGURATION = new InjectionToken<KbqTimezoneLocaleConfiguration>(
    'KbqTimezoneLocaleConfiguration',
    { factory: () => KBQ_TIMEZONE_DEFAULT_LOCALE_CONFIGURATION }
);

/**
 * Utility provider for `KBQ_TIMEZONE_LOCALE_CONFIGURATION`. Only the strings you pass are overridden; the rest keep
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
                clearByEscape: false,
                clear: () => timezoneSelect.clear(),
                canClear: () => timezoneSelect.canClear
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
    override readonly customTrigger = contentChild(KbqTimezoneSelectTrigger);

    /** Strings currently rendered by the select. */
    readonly timezoneLocaleConfiguration = inject(KbqLocaleOverridesDirective, { self: true }).read(
        'timezone',
        KBQ_TIMEZONE_LOCALE_CONFIGURATION
    );

    /** Form field of the search, whose control carries the placeholder. */
    private readonly searchFormField = contentChild(KbqSelectSearch, { read: KbqFormField });

    /**
     * Placeholder this component last wrote into the search. Compared by value: the search control reads back
     * whatever it carries, and a placeholder the consumer binds after the first render replaces this one.
     */
    private appliedLocalePlaceholder: string | null = null;

    constructor() {
        super();

        // The projected search takes its placeholder as a plain property rather than through a template
        // binding, so the string has to be pushed into it. An effect applies it as soon as the query
        // resolves, without waiting for a lifecycle hook of this component.
        effect(() => {
            const placeholder = this.timezoneLocaleConfiguration().searchPlaceholder;
            const search = this.search();

            if (!search) return;

            const current = this.searchFormField()?.control().placeholder();

            // A placeholder supplied by the consumer wins and is never overwritten; one this effect wrote
            // is replaced, so the field follows the active locale.
            if (current && current !== this.appliedLocalePlaceholder) return;

            search.setPlaceholder(placeholder);
            this.appliedLocalePlaceholder = placeholder;
        });
    }

    /**
     * Rejects `multiple` and `multiline`, which switches the select to multiple selection just the same: the
     * trigger renders a single value and the panel has no tag list or pseudo-checkboxes behind it. This is the
     * last point before the selection model is built from them, and `KbqSelect` refuses a later change of
     * `multiple` on its own.
     */
    override ngOnInit(): void {
        if (this.multiple || this.multiline()) {
            throw getKbqTimezoneSelectMultipleError();
        }

        super.ngOnInit();
    }
}
