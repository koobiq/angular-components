import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
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

// prettier-ignore
export const timezones=[{offset:"02:00:00",associatedZones:[],id:"Europe/Kaliningrad",city:"Kaliningrad",countryCode:"RU",countryName:"Russia"},{offset:"03:00:00",associatedZones:[{id:"Europe/Kirov",city:"Kirov",countryCode:"RU",countryName:"Russia"},{id:"Europe/Volgograd",city:"Volgograd",countryCode:"RU",countryName:"Russia"},{id:"Europe/Simferopol",city:"Simferopol",countryCode:"RU",countryName:"Russia"}],id:"Europe/Moscow",city:"Moscow",countryCode:"RU",countryName:"Russia"},{offset:"04:00:00",associatedZones:[{id:"Europe/Ulyanovsk",city:"Ulyanovsk",countryCode:"RU",countryName:"Russia"}],id:"Europe/Astrakhan",city:"Astrakhan",countryCode:"RU",countryName:"Russia"},{offset:"04:00:00",associatedZones:[],id:"Europe/Samara",city:"Samara",countryCode:"RU",countryName:"Russia"},{offset:"04:00:00",associatedZones:[],id:"Europe/Saratov",city:"Saratov",countryCode:"RU",countryName:"Russia"},{offset:"05:00:00",associatedZones:[],id:"Asia/Yekaterinburg",city:"Yekaterinburg",countryCode:"RU",countryName:"Russia"},{offset:"06:00:00",associatedZones:[],id:"Asia/Omsk",city:"Omsk",countryCode:"RU",countryName:"Russia"},{offset:"07:00:00",associatedZones:[],id:"Asia/Barnaul",city:"Barnaul",countryCode:"RU",countryName:"Russia"},{offset:"07:00:00",associatedZones:[{id:"Asia/Novokuznetsk",city:"Novokuznetsk",countryCode:"RU",countryName:"Russia"}],id:"Asia/Krasnoyarsk",city:"Krasnoyarsk",countryCode:"RU",countryName:"Russia"},{offset:"07:00:00",associatedZones:[],id:"Asia/Novosibirsk",city:"Novosibirsk",countryCode:"RU",countryName:"Russia"},{offset:"07:00:00",associatedZones:[],id:"Asia/Tomsk",city:"Tomsk",countryCode:"RU",countryName:"Russia"},{offset:"08:00:00",associatedZones:[],id:"Asia/Irkutsk",city:"Irkutsk",countryCode:"RU",countryName:"Russia"},{offset:"09:00:00",associatedZones:[],id:"Asia/Chita",city:"Chita",countryCode:"RU",countryName:"Russia"},{offset:"09:00:00",associatedZones:[{id:"Asia/Khandyga",city:"Khandyga",countryCode:"RU",countryName:"Russia"}],id:"Asia/Yakutsk",city:"Yakutsk",countryCode:"RU",countryName:"Russia"},{offset:"10:00:00",associatedZones:[{id:"Asia/Ust-Nera",city:"Ust-Nera",countryCode:"RU",countryName:"Russia"}],id:"Asia/Vladivostok",city:"Vladivostok",countryCode:"RU",countryName:"Russia"},{offset:"11:00:00",associatedZones:[],id:"Asia/Srednekolymsk",city:"Srednekolymsk",countryCode:"RU",countryName:"Russia"},{offset:"11:00:00",associatedZones:[],id:"Asia/Magadan",city:"Magadan",countryCode:"RU",countryName:"Russia"},{offset:"11:00:00",associatedZones:[],id:"Asia/Sakhalin",city:"Sakhalin",countryCode:"RU",countryName:"Russia"},{offset:"12:00:00",associatedZones:[{id:"Asia/Anadyr",city:"Anadyr",countryCode:"RU",countryName:"Russia"}],id:"Asia/Kamchatka",city:"Kamchatka",countryCode:"RU",countryName:"Russia"}];

/**
 * @title Timezone search
 */
@Component({
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
            <kbq-timezone-select [(value)]="selected">
                <kbq-form-field kbqFormFieldWithoutBorders kbqSelectSearch>
                    <i kbq-icon="kbq-magnifying-glass_16" kbqPrefix></i>
                    <input
                        autocomplete="off"
                        kbqInput
                        type="text"
                        [formControl]="searchControl"
                        [placeholder]="'Город или часовой пояс'"
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
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
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
