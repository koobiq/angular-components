import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqOptionModule } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqIconModule } from '@koobiq/components/icon';
import {
    getZonesGroupedByCountry,
    KbqTimezoneGroup,
    KbqTimezoneModule,
    KbqTimezoneZone
} from '@koobiq/components/timezone';

// prettier-ignore
const timezones=[{offset:"02:00:00",associatedZones:[],id:"Europe/Kaliningrad",city:"Kaliningrad",countryCode:"RU",countryName:"Russia"},{offset:"03:00:00",associatedZones:[{id:"Europe/Kirov",city:"Kirov",countryCode:"RU",countryName:"Russia"},{id:"Europe/Volgograd",city:"Volgograd",countryCode:"RU",countryName:"Russia"},{id:"Europe/Simferopol",city:"Simferopol",countryCode:"RU",countryName:"Russia"}],id:"Europe/Moscow",city:"Moscow",countryCode:"RU",countryName:"Russia"},{offset:"04:00:00",associatedZones:[{id:"Europe/Ulyanovsk",city:"Ulyanovsk",countryCode:"RU",countryName:"Russia"}],id:"Europe/Astrakhan",city:"Astrakhan",countryCode:"RU",countryName:"Russia"},{offset:"04:00:00",associatedZones:[],id:"Europe/Samara",city:"Samara",countryCode:"RU",countryName:"Russia"},{offset:"04:00:00",associatedZones:[],id:"Europe/Saratov",city:"Saratov",countryCode:"RU",countryName:"Russia"},{offset:"05:00:00",associatedZones:[],id:"Asia/Yekaterinburg",city:"Yekaterinburg",countryCode:"RU",countryName:"Russia"},{offset:"06:00:00",associatedZones:[],id:"Asia/Omsk",city:"Omsk",countryCode:"RU",countryName:"Russia"},{offset:"07:00:00",associatedZones:[],id:"Asia/Barnaul",city:"Barnaul",countryCode:"RU",countryName:"Russia"},{offset:"07:00:00",associatedZones:[{id:"Asia/Novokuznetsk",city:"Novokuznetsk",countryCode:"RU",countryName:"Russia"}],id:"Asia/Krasnoyarsk",city:"Krasnoyarsk",countryCode:"RU",countryName:"Russia"},{offset:"07:00:00",associatedZones:[],id:"Asia/Novosibirsk",city:"Novosibirsk",countryCode:"RU",countryName:"Russia"},{offset:"07:00:00",associatedZones:[],id:"Asia/Tomsk",city:"Tomsk",countryCode:"RU",countryName:"Russia"},{offset:"08:00:00",associatedZones:[],id:"Asia/Irkutsk",city:"Irkutsk",countryCode:"RU",countryName:"Russia"},{offset:"09:00:00",associatedZones:[],id:"Asia/Chita",city:"Chita",countryCode:"RU",countryName:"Russia"},{offset:"09:00:00",associatedZones:[{id:"Asia/Khandyga",city:"Khandyga",countryCode:"RU",countryName:"Russia"}],id:"Asia/Yakutsk",city:"Yakutsk",countryCode:"RU",countryName:"Russia"},{offset:"10:00:00",associatedZones:[{id:"Asia/Ust-Nera",city:"Ust-Nera",countryCode:"RU",countryName:"Russia"}],id:"Asia/Vladivostok",city:"Vladivostok",countryCode:"RU",countryName:"Russia"},{offset:"11:00:00",associatedZones:[],id:"Asia/Srednekolymsk",city:"Srednekolymsk",countryCode:"RU",countryName:"Russia"},{offset:"11:00:00",associatedZones:[],id:"Asia/Magadan",city:"Magadan",countryCode:"RU",countryName:"Russia"},{offset:"11:00:00",associatedZones:[],id:"Asia/Sakhalin",city:"Sakhalin",countryCode:"RU",countryName:"Russia"},{offset:"12:00:00",associatedZones:[{id:"Asia/Anadyr",city:"Anadyr",countryCode:"RU",countryName:"Russia"}],id:"Asia/Kamchatka",city:"Kamchatka",countryCode:"RU",countryName:"Russia"}];

/**
 * @title Timezone trigger
 */
@Component({
    selector: 'timezone-trigger-overview-example',
    imports: [KbqFormFieldModule, KbqTimezoneModule, KbqOptionModule, KbqIconModule],
    template: `
        <kbq-form-field>
            <kbq-timezone-select [(value)]="selected">
                <kbq-timezone-select-trigger>
                    <div class="layout-row layout-align-start-center">
                        <i color="contrast-fade" kbq-icon="kbq-clock_16" style="margin-right: 8px"></i>
                        <span>{{ selected }}</span>
                    </div>
                </kbq-timezone-select-trigger>

                @for (group of data; track group) {
                    <kbq-optgroup [label]="group.countryName">
                        @for (timezone of group.zones; track timezone) {
                            <kbq-timezone-option [timezone]="timezone" />
                        }
                    </kbq-optgroup>
                }
            </kbq-timezone-select>
        </kbq-form-field>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimezoneTriggerOverviewExample {
    selected = Intl.DateTimeFormat().resolvedOptions().timeZone;

    readonly data: KbqTimezoneGroup[] = [];

    constructor() {
        const zones: KbqTimezoneZone[] = timezones.map(({ associatedZones, ...zone }) => ({
            ...zone,
            cities: Array.isArray(associatedZones)
                ? associatedZones
                      .map(({ city }) => city)
                      .sort()
                      .join(', ')
                : ''
        }));

        this.data = getZonesGroupedByCountry(zones, 'Другие страны');
    }
}
