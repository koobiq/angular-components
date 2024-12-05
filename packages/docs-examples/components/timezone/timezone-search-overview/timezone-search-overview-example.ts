import { AsyncPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqOptionModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import {
    KbqTimezoneGroup,
    KbqTimezoneModule,
    KbqTimezoneZone,
    getZonesGroupedByCountry,
    offsetFormatter
} from '@koobiq/components/timezone';
import { Observable, merge, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { timezones } from '../mock';

/**
 * @title Timezone search
 */
@Component({
    standalone: true,
    selector: 'timezone-search-overview-example',
    imports: [
        KbqFormFieldModule,
        KbqTimezoneModule,
        KbqIconModule,
        KbqSelectModule,
        KbqInputModule,
        ReactiveFormsModule,
        AsyncPipe,
        KbqOptionModule
    ],
    template: `
        <kbq-form-field>
            <kbq-timezone-select panelWidth="auto" [(value)]="selected">
                <kbq-form-field kbqFormFieldWithoutBorders kbqSelectSearch>
                    <i kbq-icon="kbq-magnifying-glass_16" kbqPrefix></i>
                    <input
                        [formControl]="searchControl"
                        [placeholder]="'Город или часовой пояс'"
                        autocomplete="off"
                        kbqInput
                        type="text"
                    />
                    <kbq-cleaner />
                </kbq-form-field>

                <div kbq-select-search-empty-result>Ничего не найдено</div>

                @for (group of filteredOptions$ | async; track group) {
                    <kbq-optgroup [label]="group.countryName">
                        @for (timezone of group.zones; track timezone) {
                            <kbq-timezone-option [highlightText]="searchPattern" [timezone]="timezone" />
                        }
                    </kbq-optgroup>
                }
            </kbq-timezone-select>
        </kbq-form-field>
    `
})
export class TimezoneSearchOverviewExample implements OnInit {
    filteredOptions$: Observable<KbqTimezoneGroup[]>;
    searchControl: FormControl = new FormControl();
    selected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    priorityCountry: string;

    get searchPattern(): string {
        const searchString: string = (this.searchControl.value || '').trim();

        const reRegExpChar: RegExp = /[\/\\^$.*+?()[\]{}|\s]/g;
        const reHasRegExpChar: RegExp = RegExp(reRegExpChar.source);

        const escapedString =
            searchString && reHasRegExpChar.test(searchString)
                ? searchString.replace(reRegExpChar, '\\$&')
                : searchString;

        return escapedString.replace(/[\-—−]/g, '(-|—|−)');
    }

    private readonly data: KbqTimezoneZone[];

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

        this.priorityCountry = this.data.find(
            (item: KbqTimezoneZone) => item.id === Intl.DateTimeFormat().resolvedOptions().timeZone
        )?.countryCode as string;
    }

    ngOnInit(): void {
        this.filteredOptions$ = merge(
            of(getZonesGroupedByCountry(this.data, 'Другие страны')),
            this.searchControl.valueChanges.pipe(
                distinctUntilChanged(),
                debounceTime(500),
                map(() => {
                    if (!this.searchControl.value) {
                        return getZonesGroupedByCountry(this.data, 'Другие страны');
                    }

                    return this.getFilteredData();
                })
            )
        );
    }

    private getFilteredData(): KbqTimezoneGroup[] {
        const regex: RegExp = RegExp(`(${this.searchPattern})`, 'i');

        const options: KbqTimezoneZone[] = this.data.filter((timezone: KbqTimezoneZone) => {
            const fields: string[] = [
                offsetFormatter(timezone.offset),
                timezone.city,
                timezone.cities
            ];

            return regex.test(fields.join(' ')) || fields.some((timezoneValue: string) => regex.test(timezoneValue));
        });

        return getZonesGroupedByCountry(options, 'Другие страны', this.priorityCountry);
    }
}
