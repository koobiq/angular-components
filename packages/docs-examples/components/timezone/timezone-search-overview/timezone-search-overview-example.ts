import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { createSearchPredicate, kbqInjectLocaleConfiguration, tokenizeSearchQuery } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import {
    collapseOtherCountries,
    getZonesGroupedByCountry,
    KBQ_TIMEZONE_CONFIGURATION,
    kbqResolveHostCountry,
    KbqTimezoneGroup,
    KbqTimezoneModule,
    KbqTimezoneZone,
    offsetFormatter,
    resolveZoneOffset
} from '@koobiq/components/timezone';
import { merge, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { timezones } from '../timezone-data';

/** `offsetFormatter` renders the sign with U+2212 (minus sign), which a normal keyboard can't type. */
function normalizeOffsetDash(value: string): string {
    return value.replace(/[—−]/g, '-');
}

/**
 * @title Timezone search
 */
@Component({
    selector: 'timezone-search-overview-example',
    imports: [
        KbqTimezoneModule,
        KbqIconModule,
        KbqSelectModule,
        KbqInputModule,
        ReactiveFormsModule,
        AsyncPipe
    ],
    template: `
        <kbq-form-field>
            <kbq-timezone-select [(value)]="selected">
                <!-- No [placeholder] here: the select fills it in from the active locale. -->
                <kbq-form-field noBorders kbqSelectSearch>
                    <i kbq-icon="kbq-magnifying-glass_16" kbqPrefix></i>
                    <input autocomplete="off" kbqInput type="text" [formControl]="searchControl" />
                    <kbq-cleaner />
                </kbq-form-field>

                <div kbq-select-search-empty-result>Nothing found</div>

                @for (group of filteredOptions$ | async; track group) {
                    <kbq-optgroup [label]="group.countryName">
                        @for (timezone of group.zones; track timezone) {
                            <kbq-timezone-option
                                [highlightText]="searchTokens"
                                [foldDiacritics]="true"
                                [timezone]="timezone"
                            />
                        }
                    </kbq-optgroup>
                }
            </kbq-timezone-select>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimezoneSearchOverviewExample implements OnInit {
    filteredOptions$: Observable<KbqTimezoneGroup[]>;
    searchControl: FormControl = new FormControl();
    selected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    priorityCountry?: string;
    protected searchTokens: string[] = [];

    private readonly data: KbqTimezoneZone[];
    private readonly configuration = kbqInjectLocaleConfiguration('timezone', KBQ_TIMEZONE_CONFIGURATION);

    constructor() {
        this.data = timezones.map(({ associatedZones, ...zone }) => ({
            ...zone,
            cities: Array.isArray(associatedZones)
                ? associatedZones
                      .map(({ city }) => city)
                      .sort()
                      .join(', ')
                : ''
        }));

        this.priorityCountry = kbqResolveHostCountry(this.data);
    }

    ngOnInit(): void {
        this.filteredOptions$ = merge(
            of(this.group(this.data)),
            this.searchControl.valueChanges.pipe(
                distinctUntilChanged(),
                debounceTime(500),
                map(() => this.group(this.getFilteredData()))
            )
        );
    }

    /** The host's country first, every other country behind one localized label. */
    private group(zones: KbqTimezoneZone[]): KbqTimezoneGroup[] {
        return collapseOtherCountries(
            getZonesGroupedByCountry(zones),
            this.priorityCountry,
            this.configuration().otherCountriesLabel
        );
    }

    private getFilteredData(): KbqTimezoneZone[] {
        this.searchTokens = tokenizeSearchQuery(this.searchControl.value ?? '');

        const predicate = createSearchPredicate(this.searchControl.value ?? '');

        return this.data.filter((timezone: KbqTimezoneZone) =>
            predicate([
                normalizeOffsetDash(offsetFormatter(resolveZoneOffset(timezone))),
                timezone.city,
                timezone.cities
            ])
        );
    }
}
