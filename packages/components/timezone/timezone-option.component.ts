import { KeyValuePipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    forwardRef,
    Input,
    input,
    viewChild,
    ViewEncapsulation
} from '@angular/core';
import { KBQ_TITLE_TEXT_REF, KbqHighlightBackgroundPipe, KbqOption } from '@koobiq/components/core';
import { CitiesByFilterPipe } from './cities-by-filter.pipe';
import { KbqTimezoneZone } from './timezone.models';
import { filterCitiesBySearchString, offsetFormatter, resolveZoneOffset } from './timezone.utils';
import { UtcOffsetPipe } from './utc-offset.pipe';

@Component({
    selector: 'kbq-timezone-option',
    imports: [
        UtcOffsetPipe,
        KeyValuePipe,
        KbqHighlightBackgroundPipe,
        CitiesByFilterPipe
    ],
    templateUrl: 'timezone-option.component.html',
    styleUrls: ['../core/option/option.scss', 'timezone-option.component.scss'],
    providers: [
        {
            provide: KbqOption,
            useExisting: forwardRef(() => KbqTimezoneOption)
        },
        // Declared again rather than inherited from `KbqOption`: Angular copies `providers` to a subclass
        // only when that subclass has no decorator of its own, and this one has.
        {
            provide: KBQ_TITLE_TEXT_REF,
            useExisting: forwardRef(() => KbqTimezoneOption)
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-timezone-option'
    },
    exportAs: 'kbqTimezoneOption'
})
export class KbqTimezoneOption extends KbqOption {
    readonly tooltipContentWrapper = viewChild.required<ElementRef<HTMLElement>>('tooltipContentWrapper');
    readonly tooltipContent = viewChild.required<ElementRef<HTMLElement>>('tooltipContent');

    readonly highlightText = input<string | readonly string[]>(undefined!);

    /** Whether `highlightText` was matched with diacritic folding (e.g. via `createSearchPredicate`) — see `kbqHighlightBackground`. */
    readonly foldDiacritics = input(false);

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input()
    get timezone(): KbqTimezoneZone {
        return this._timezone;
    }

    set timezone(zone: KbqTimezoneZone) {
        this._timezone = zone;
        this.value = zone.id;
    }

    private _timezone: KbqTimezoneZone;

    /** Offset the bound zone is on right now, written the way `KbqTimezoneZone.offset` is. */
    protected get resolvedOffset(): string {
        return resolveZoneOffset(this.timezone);
    }

    /** The whole zone as one line: the offset, the city and every city the zone covers. */
    get viewValue(): string {
        return this.buildViewValue(this.timezone.cities);
    }

    /**
     * The same line as {@link viewValue}, but with the city list narrowed by `highlightText` exactly as the
     * rendered list is. The overflow tooltip shows this one, so it never lists a city the search has just
     * filtered out of the option under it.
     */
    get tooltipViewValue(): string {
        return this.buildViewValue(filterCitiesBySearchString(this.timezone.cities, this.highlightText()));
    }

    private buildViewValue(cities: string): string {
        return [offsetFormatter(this.resolvedOffset), [this.timezone.city, cities].filter(Boolean).join(', ')].join(
            ' '
        );
    }
}
